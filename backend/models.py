from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import re

# Modelos de Usuario
class UserBase(BaseModel):
    nome_completo: str
    email: EmailStr
    telefone: str
    cpf: str
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None

class UserCreate(UserBase):
    senha: str
    
    @validator('cpf')
    def validate_cpf_cnpj(cls, v):
        # Remove caracteres especiais
        v = re.sub(r'[^0-9]', '', v)
        if len(v) not in [11, 14]:
            raise ValueError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos')
        return v
    
    @validator('telefone')
    def validate_telefone(cls, v):
        telefone_clean = re.sub(r'[^0-9]', '', v)
        if len(telefone_clean) < 10:
            raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    senha_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(UserBase):
    id: str
    created_at: datetime

# Modelos de Produto/Carrinho
class CartItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    image: str

class Cart(BaseModel):
    user_id: Optional[str] = None
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Modelos de Pedido
class CustomerData(BaseModel):
    nome: str
    email: str
    telefone: str
    cpf: str

class AddressData(BaseModel):
    cep: str
    rua: str
    numero: str
    bairro: str
    cidade: str
    estado: str

class PaymentData(BaseModel):
    tipo: str  # credit_card, paypal, pix, boleto, transferencia
    plataforma: Optional[str] = None  # mercadopago, infinitepay, pagseguro, paypal
    banco: Optional[str] = None  # bb, itau (para pix/boleto/transferencia)
    token: Optional[str] = None
    payment_method_id: Optional[str] = None
    issuer_id: Optional[str] = None
    installments: Optional[int] = None

class OrderCreate(BaseModel):
    carrinho: List[CartItem]
    cliente: CustomerData
    endereco: AddressData
    pagamento: PaymentData
    total: float

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    carrinho: List[CartItem]
    cliente: CustomerData
    endereco: AddressData
    pagamento: PaymentData
    total: float
    status: str = "pendente"  # pendente, pago, cancelado, erro
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Modelos de Resposta
class StatusResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None

class PaymentResponse(BaseModel):
    success: bool
    message: str
    payment_id: Optional[str] = None
    payment_url: Optional[str] = None
    redirect: Optional[str] = None

# Modelos para validação externa
class CPFValidation(BaseModel):
    cpf: str
    nome: str

class CNPJValidation(BaseModel):
    cnpj: str
    nome: str

class CEPResponse(BaseModel):
    cep: str
    logradouro: str
    bairro: str
    localidade: str
    uf: str
    erro: Optional[bool] = None