from fastapi import APIRouter
from models import StatusResponse, CEPResponse
from utils import get_address_by_cep, calculate_shipping

router = APIRouter(prefix="/utils", tags=["Utils"])

@router.get("/cep/{cep}", response_model=StatusResponse)
async def get_cep_info(cep: str):
    """Consulta informações do CEP"""
    
    result = await get_address_by_cep(cep)
    
    if result.get("erro"):
        return StatusResponse(
            success=False,
            message=result.get("message", "CEP não encontrado")
        )
    
    return StatusResponse(
        success=True,
        message="CEP encontrado",
        data={
            "endereco": {
                "cep": result.get("cep"),
                "rua": result.get("logradouro"),
                "bairro": result.get("bairro"),
                "cidade": result.get("localidade"),
                "estado": result.get("uf")
            }
        }
    )

@router.get("/shipping/{estado}")
async def calculate_shipping_cost(estado: str):
    """Calcula custo de frete por estado"""
    
    custo = calculate_shipping(estado)
    
    return StatusResponse(
        success=True,
        message="Frete calculado",
        data={"shipping_cost": custo, "estado": estado}
    )