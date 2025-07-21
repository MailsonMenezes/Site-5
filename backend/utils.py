import re
import requests
from typing import Dict, Any, Optional
import os

# Função de validação de CPF
def validate_cpf(cpf: str) -> bool:
    """Valida CPF usando algoritmo oficial"""
    cpf = re.sub(r'[^0-9]', '', cpf)
    
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    
    # Calcula primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    if int(cpf[9]) != digito1:
        return False
    
    # Calcula segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    return int(cpf[10]) == digito2

async def validate_cnpj_with_name(cnpj: str, nome: str) -> Dict[str, Any]:
    """Valida CNPJ e nome usando API ReceitaWS"""
    cnpj_clean = re.sub(r'[^0-9]', '', cnpj)
    
    if len(cnpj_clean) != 14:
        return {"valid": False, "message": "CNPJ deve ter 14 dígitos"}
    
    receita_token = os.environ.get("RECEITA_WS_TOKEN", "")
    
    if not receita_token:
        return {"valid": False, "message": "Token ReceitaWS não configurado"}
    
    url = f"https://www.receitaws.com.br/v1/cnpj/{cnpj_clean}?token={receita_token}"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if response.status_code != 200 or "nome" not in data:
            return {"valid": False, "message": "CNPJ não encontrado ou inválido"}
        
        # Verifica se o nome informado está presente no nome da empresa
        nome_empresa = data.get("nome", "").lower()
        nome_informado = nome.lower()
        
        if nome_informado not in nome_empresa and nome_empresa not in nome_informado:
            return {
                "valid": False, 
                "message": f"Nome não confere com CNPJ. Empresa: {data.get('nome')}"
            }
        
        return {
            "valid": True, 
            "message": "CNPJ válido", 
            "empresa_data": data
        }
    
    except requests.RequestException:
        return {"valid": False, "message": "Erro ao consultar ReceitaWS"}

async def get_address_by_cep(cep: str) -> Dict[str, Any]:
    """Consulta endereço pelo CEP usando ViaCEP"""
    cep_clean = re.sub(r'[^0-9]', '', cep)
    
    if len(cep_clean) != 8:
        return {"erro": True, "message": "CEP deve ter 8 dígitos"}
    
    url = f"https://viacep.com.br/ws/{cep_clean}/json/"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if response.status_code == 200 and not data.get("erro"):
            return data
        else:
            return {"erro": True, "message": "CEP não encontrado"}
            
    except requests.RequestException:
        return {"erro": True, "message": "Erro ao consultar ViaCEP"}

def calculate_shipping(estado: str) -> float:
    """Calcula frete baseado no estado"""
    fretes = {
        'SP': 15.00,
        'RJ': 18.00, 
        'MG': 20.00
    }
    return fretes.get(estado, 30.00)  # Valor padrão para outros estados

def format_currency(value: float) -> str:
    """Formata valor para moeda brasileira"""
    return f"R$ {value:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')