from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models import OrderCreate, Order, StatusResponse, PaymentResponse
from ..auth import get_current_user
from ..database import orders_collection, carts_collection
from ..utils import calculate_shipping

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/create", response_model=PaymentResponse)
async def create_order(
    order_data: OrderCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Cria pedido e processa pagamento"""
    
    # Cria pedido
    order = Order(
        user_id=current_user_id,
        **order_data.dict()
    )
    
    try:
        # Salva pedido
        result = await orders_collection.insert_one(order.dict())
        
        # Limpa carrinho após pedido criado
        await carts_collection.delete_one({"user_id": current_user_id})
        
        # Simula processamento de pagamento baseado no tipo
        payment_result = await process_payment(order)
        
        if payment_result["success"]:
            # Atualiza status do pedido
            await orders_collection.update_one(
                {"id": order.id},
                {"$set": {"status": "pago", "payment_id": payment_result.get("payment_id")}}
            )
        
        return PaymentResponse(
            success=payment_result["success"],
            message=payment_result["message"],
            payment_id=payment_result.get("payment_id"),
            payment_url=payment_result.get("payment_url"),
            redirect=payment_result.get("redirect", "/confirmacao")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar pedido: {str(e)}"
        )

@router.get("/my-orders", response_model=StatusResponse)
async def get_user_orders(current_user_id: str = Depends(get_current_user)):
    """Retorna pedidos do usuário"""
    
    try:
        orders = await orders_collection.find(
            {"user_id": current_user_id}
        ).sort("created_at", -1).to_list(100)
        
        return StatusResponse(
            success=True,
            message="Pedidos recuperados com sucesso",
            data={"orders": orders}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao recuperar pedidos"
        )

@router.get("/{order_id}", response_model=StatusResponse)
async def get_order_details(
    order_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Retorna detalhes de um pedido específico"""
    
    order = await orders_collection.find_one({
        "id": order_id,
        "user_id": current_user_id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado"
        )
    
    return StatusResponse(
        success=True,
        message="Pedido encontrado",
        data={"order": order}
    )

async def process_payment(order: Order) -> dict:
    """
    Processa pagamento baseado no tipo/plataforma
    NOTA: Implementação simplificada - integrações reais virão depois
    """
    
    payment_type = order.pagamento.tipo
    plataforma = order.pagamento.plataforma
    
    # Simulação básica para desenvolvimento
    if payment_type == "credit_card":
        if plataforma == "mercadopago":
            return {
                "success": True,
                "message": "Pagamento processado via Mercado Pago",
                "payment_id": f"mp_{order.id}",
                "redirect": "/confirmacao"
            }
        else:
            return {
                "success": True,
                "message": f"Pagamento processado via {plataforma}",
                "payment_id": f"{plataforma}_{order.id}",
                "redirect": "/confirmacao"
            }
    
    elif payment_type == "paypal":
        return {
            "success": True,
            "message": "Redirecionando para PayPal",
            "payment_url": f"https://paypal.com/checkout?order_id={order.id}",
            "redirect": "/confirmacao"
        }
    
    elif payment_type in ["pix", "boleto", "transferencia"]:
        banco = order.pagamento.banco or "bb"
        return {
            "success": True,
            "message": f"Pagamento {payment_type} gerado - {banco.upper()}",
            "payment_id": f"{banco}_{payment_type}_{order.id}",
            "redirect": "/confirmacao"
        }
    
    else:
        return {
            "success": False,
            "message": "Método de pagamento não suportado"
        }