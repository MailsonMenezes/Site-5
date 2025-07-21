from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from models import CartItem, Cart, StatusResponse
from auth import get_current_user
from database import carts_collection

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/save", response_model=StatusResponse)
async def save_cart(
    cart_items: List[CartItem], 
    current_user_id: str = Depends(get_current_user)
):
    """Salva carrinho do usuário"""
    
    cart = Cart(user_id=current_user_id, items=cart_items)
    
    try:
        # Atualiza ou insere carrinho
        await carts_collection.replace_one(
            {"user_id": current_user_id},
            cart.dict(),
            upsert=True
        )
        
        return StatusResponse(
            success=True,
            message="Carrinho salvo com sucesso"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar carrinho"
        )

@router.get("/get", response_model=StatusResponse)
async def get_cart(current_user_id: str = Depends(get_current_user)):
    """Recupera carrinho do usuário"""
    
    cart = await carts_collection.find_one({"user_id": current_user_id})
    
    if not cart:
        return StatusResponse(
            success=True,
            message="Carrinho vazio",
            data={"cart": []}
        )
    
    return StatusResponse(
        success=True,
        message="Carrinho recuperado com sucesso",
        data={"cart": cart.get("items", [])}
    )

@router.delete("/clear", response_model=StatusResponse)
async def clear_cart(current_user_id: str = Depends(get_current_user)):
    """Limpa carrinho do usuário"""
    
    try:
        await carts_collection.delete_one({"user_id": current_user_id})
        
        return StatusResponse(
            success=True,
            message="Carrinho limpo com sucesso"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao limpar carrinho"
        )

@router.post("/add-item", response_model=StatusResponse)
async def add_item_to_cart(
    item: CartItem,
    current_user_id: str = Depends(get_current_user)
):
    """Adiciona item ao carrinho"""
    
    cart = await carts_collection.find_one({"user_id": current_user_id})
    
    if not cart:
        cart = Cart(user_id=current_user_id, items=[item])
    else:
        cart = Cart(**cart)
        # Verifica se item já existe
        existing_item = next((i for i in cart.items if i.id == item.id), None)
        
        if existing_item:
            existing_item.quantity += item.quantity
        else:
            cart.items.append(item)
    
    try:
        await carts_collection.replace_one(
            {"user_id": current_user_id},
            cart.dict(),
            upsert=True
        )
        
        return StatusResponse(
            success=True,
            message="Item adicionado ao carrinho"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao adicionar item"
        )

@router.put("/update-item/{item_id}", response_model=StatusResponse)
async def update_cart_item(
    item_id: str,
    quantity: int,
    current_user_id: str = Depends(get_current_user)
):
    """Atualiza quantidade de um item no carrinho"""
    
    cart = await carts_collection.find_one({"user_id": current_user_id})
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrinho não encontrado"
        )
    
    cart = Cart(**cart)
    item_found = False
    
    for item in cart.items:
        if item.id == item_id:
            if quantity <= 0:
                cart.items.remove(item)
            else:
                item.quantity = quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado no carrinho"
        )
    
    try:
        await carts_collection.replace_one(
            {"user_id": current_user_id},
            cart.dict()
        )
        
        return StatusResponse(
            success=True,
            message="Item atualizado com sucesso"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar item"
        )