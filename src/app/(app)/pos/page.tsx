"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Product, CartItem } from "@/lib/types";
import { ReceiptPrinter } from "@/components/ReceiptPrinter/ReceiptPrinter";

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }
async function getUserId() { const m = await import("@/lib/supabase"); return m.getCurrentUserId(); }

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("todos");
  const [receiptStage, setReceiptStage] = useState<"idle" | "processing" | "printing" | "complete">("idle");
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [clientModal, setClientModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientConcept, setClientConcept] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    getUserId().then((id) => {
      setUserId(id);
      getS().then((supabase) => supabase.from("products").select("*").eq("user_id", id).order("name").then(({ data }: any) => {
        if (data) setProducts(data);
      }));
    });
  }, []);

  const categories = ["todos", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === "todos" ? products : products.filter((p) => p.category === category);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: product.id, name: product.name, emoji: product.emoji, price: product.price, qty: 1 }];
    });
  };

  const changeQty = (idx: number, dir: number) => {
    setCart((prev) => {
      const newQty = prev[idx].qty + dir;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      return prev.map((c, i) => (i === idx ? { ...c, qty: newQty } : c));
    });
  };

  const removeFromCart = (idx: number) => setCart((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const processCheckout = async (method: string, clientNameVal?: string, conceptVal?: string) => {
    if (cart.length === 0) return;
    const supabase = await getS();

    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert({
        user_id: userId,
        date: new Date().toISOString().slice(0, 10),
        subtotal,
        tax,
        total,
        method,
        client_name: clientNameVal || null,
        concept: conceptVal || null,
      })
      .select()
      .single();

    if (saleError || !saleData) {
      alert("Error al procesar la venta");
      return;
    }

    const saleItems = cart.map((item) => ({
      sale_id: saleData.id,
      product_id: item.id,
      product_name: item.name,
      product_emoji: item.emoji,
      price: item.price,
      qty: item.qty,
    }));

    await supabase.from("sale_items").insert(saleItems);

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        await supabase.from("products").update({ stock: product.stock - item.qty }).eq("id", item.id);
      }
    }

    if (method === "credito") {
      await supabase.from("credits").insert({
        user_id: userId,
        client: clientNameVal,
        amount: total,
        paid: 0,
        pending: total,
        status: "pendiente",
        concept: conceptVal,
        sale_id: saleData.id,
        date: new Date().toISOString().slice(0, 10),
      });
    }

    setLastSaleTotal(total);
    setCart([]);
    setReceiptStage("processing");

    setTimeout(() => setReceiptStage("printing"), 1500);
    setTimeout(() => setReceiptStage("complete"), 3500);
    setTimeout(() => setReceiptStage("idle"), 8000);

    const { data: updated } = await supabase.from("products").select("*").eq("user_id", userId).order("name");
    if (updated) setProducts(updated);
  };

  const handleCheckout = (method: string) => {
    if (method === "credito") {
      setClientName("");
      setClientConcept("Compra en colmado");
      setClientModal(true);
      return;
    }
    processCheckout(method);
  };

  const confirmCredit = () => {
    if (!clientName.trim()) return;
    setClientModal(false);
    processCheckout("credito", clientName, clientConcept);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5 min-h-[calc(100vh-120px)]">
      <div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                category === c
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-500"
              }`}
            >
              {c === "todos" ? "Todos" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`bg-white border-2 border-gray-200 rounded-xl p-4 text-center transition hover:-translate-y-0.5 hover:border-teal-500 ${
                p.stock <= 0 ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className="text-xs font-semibold mb-1">{p.name}</div>
              <div className="text-base font-extrabold text-teal-700">{formatCurrency(p.price)}</div>
              <div className="text-[10px] text-gray-400">Stock: {p.stock}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">🛒 Carrito</h3>

        <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Carrito vacío</p>
          ) : (
            cart.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <span>{item.emoji} {item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(i, -1)} className="w-6 h-6 rounded border border-gray-200 text-xs flex items-center justify-center hover:bg-gray-50">-</button>
                  <span className="w-5 text-center font-semibold">{item.qty}</span>
                  <button onClick={() => changeQty(i, 1)} className="w-6 h-6 rounded border border-gray-200 text-xs flex items-center justify-center hover:bg-gray-50">+</button>
                  <span className="w-16 text-right font-bold">{formatCurrency(item.price * item.qty)}</span>
                  <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600 text-base">✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t-2 border-gray-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>ITBIS (18%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between text-lg font-extrabold text-teal-700"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        <div className="mt-4 space-y-2">
          <button onClick={() => handleCheckout("efectivo")} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition">💰 Pagar efectivo</button>
          <button onClick={() => handleCheckout("tarjeta")} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">💳 Pagar tarjeta</button>
          <button onClick={() => handleCheckout("credito")} className="w-full py-3 bg-white border-2 border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition">📝 Fiado / Crédito</button>
          <button onClick={() => setCart([])} className="w-full py-2 text-red-500 text-sm font-semibold hover:text-red-700 transition">🗑️ Vaciar carrito</button>
        </div>
      </div>

      {receiptStage !== "idle" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => receiptStage === "complete" && setReceiptStage("idle")}>
          <ReceiptPrinter.Root
            stage={receiptStage === "complete" ? "complete" : receiptStage === "printing" ? "printing" : "processing"}
          >
            <ReceiptPrinter.Machine>
              <ReceiptPrinter.Header>
                <ReceiptPrinter.Screen>
                  <ReceiptPrinter.Status />
                </ReceiptPrinter.Screen>
              </ReceiptPrinter.Header>
              <ReceiptPrinter.Paper>
                <ReceiptPrinter.Output>
                  <div className="text-center space-y-3 py-4">
                    <div className="text-2xl font-bold">ColmadoApp</div>
                    <div className="text-xs text-gray-500">---</div>
                    <div className="text-xs">Venta completada</div>
                    <div className="text-xl font-bold text-teal-700">{formatCurrency(lastSaleTotal)}</div>
                    <div className="text-xs text-gray-500">Gracias por su compra</div>
                    <div className="text-[10px] text-gray-400 mt-4">{new Date().toLocaleString("es-DO")}</div>
                  </div>
                </ReceiptPrinter.Output>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Machine>
          </ReceiptPrinter.Root>
        </div>
      )}

      {clientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Crédito / Fiado</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre del cliente</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Concepto</label>
                <input type="text" value={clientConcept} onChange={(e) => setClientConcept(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setClientModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmCredit} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
