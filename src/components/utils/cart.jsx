export function loadCart() {
  const cart = localStorage.getItem("cart");
  if (cart != null) {
    return JSON.parse(cart);
  } else {
    return [];
  }
}

export function addToCart(productId, qty) {
  const cart = loadCart();
  const index = cart.findIndex((item) => {
    return item.productId == productId;
  });
  if (index == -1) {
    cart.push({ productId, qty });
  } else {
    const newQty = cart[index].qty + qty;
    if (newQty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].qty = newQty;
    }
  }
  saveCart(cart);
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}

export function deleteItem(productId) {
  const cart = loadCart();
  const index = cart.findIndex((item) => item.productId == productId);
  if (index != -1) {
    cart.splice(index, 1);
    saveCart(cart);
  }
}




// මේක ඔයාගේ cart.js ෆයිල් එකේ අන්තිමට එකතු කරන්න

export function updateItemQty(productId, qty) {
  const cart = loadCart();
  const index = cart.findIndex((item) => item.productId == productId);
  
  if (index != -1) {
    if (qty <= 0) {
      // ප්‍රමාණය 0 හෝ ඊට අඩු නම් item එක ඉවත් කරන්න
      cart.splice(index, 1);
    } else {
      // නැත්නම් අලුත් ප්‍රමාණය set කරන්න
      cart[index].qty = qty;
    }
    saveCart(cart);
  }
}