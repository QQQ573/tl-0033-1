import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('gm_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [adopterInfo, setAdopterInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('gm_adopter')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem('gm_cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('gm_adopter', JSON.stringify(adopterInfo))
  }, [adopterInfo])

  const addToCart = (monkey, tier) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.monkey.id === monkey.id)
      if (exists) {
        return prev.map((item) =>
          item.monkey.id === monkey.id ? { ...item, tier } : item
        )
      }
      return [...prev, { monkey, tier }]
    })
  }

  const removeFromCart = (monkeyId) => {
    setCartItems((prev) => prev.filter((item) => item.monkey.id !== monkeyId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.tier.price), 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        adopterInfo,
        setAdopterInfo
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
