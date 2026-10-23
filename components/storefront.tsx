"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Catalog, CartItem, Product } from "@/lib/types";
import Modal from "./modal";
import DishPhoto from "./dish-photo";
import FeaturedCombos from "./featured-combos";
import {COMBO_CATEGORY_ID,comboProducts,comboDiscount} from "@/lib/combos";
import RestaurantInfo from "./restaurant-info";
import HeartIcon from "./heart-icon";
import { FAVORITES_KEY, readFavoriteIds, toggleFavoriteId } from "@/lib/favorites";
import { sortCatalog, type CatalogSort } from "@/lib/catalog-sort";
const currency = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }),
  money = (n: number) => currency.format(n);
const clean = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const demo = true;

export default function Storefront({ catalog }: { catalog: Catalog }) {
  const combos=catalog.combos||[],combosReady=true,combosError="";
  const allProducts=useMemo(()=>comboProducts(catalog.products,combos),[catalog.products,combos]);
  const categories=useMemo(()=>[{id:COMBO_CATEGORY_ID,name:"Combos",sort_order:-10,active:true},...catalog.categories.filter(c=>c.id!==COMBO_CATEGORY_ID)],[catalog.categories]);
  const [category,setCategory]=useState("Todos"),[query,setQuery]=useState(""),[favorites,setFavorites]=useState<string[]>([]),[favoritesReady,setFavoritesReady]=useState(false),[sortOrder,setSortOrder]=useState<CatalogSort>("catalog"),[menuPage,setMenuPage]=useState(1),[cart,setCart]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[branchId,setBranch]=useState(catalog.branches[0]?.id||""),[mode,setMode]=useState("Recojo"),[panel,setPanel]=useState(""),[selected,setSelected]=useState<Product|null>(null),[variantId,setVariant]=useState(""),[toast,setToast]=useState(""),[undo,setUndo]=useState<CartItem[]|null>(null);
  const busy=false,uncertain=false,noticeTimer=useRef<ReturnType<typeof setTimeout>|null>(null),mainRef=useRef<HTMLElement>(null);
  const branch = catalog.branches.find((b) => b.id === branchId),
    count = cart.reduce((sum, i) => sum + i.quantity, 0);
  function itemDetails(i: CartItem) {
    const product = allProducts.find((p) => p.id === i.product_id),
      variant = catalog.variants.find((v) => v.id === i.variant_id);
    return {
      product,
      name: product
        ? product.name + (variant ? " · " + variant.name : "")
        : "Plato no disponible",
      price: variant ? Number(variant.price) : Number(product?.price || 0),
    };
  }
  const unavailableCart=cart.some(i=>!allProducts.some(p=>p.id===i.product_id));
  const subtotal = cart.reduce(
      (sum, i) => sum + itemDetails(i).price * i.quantity,
      0,
    );
  const recommendedId = categories.find((c) => c.name === "Recomendados")?.id;
  const visible = sortCatalog(allProducts, catalog.variants, sortOrder).filter(
    (p) =>
      (category === "Favoritos" ? favorites.includes(p.id) : category === "Todos" || category === recommendedId || p.category_id === category) &&
      clean(p.name + " " + p.description).includes(clean(query)),
  );
  const favoriteCount = allProducts.filter(p => favorites.includes(p.id)).length;
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(menuPage, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageProducts = visible.slice(pageStart, pageStart + pageSize);
  function changeMenuPage(next: number) {
    setMenuPage(Math.max(1, Math.min(next, pageCount)));
    const heading = document.getElementById("menu-results-title");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function toggleFavorite(product: Product) {
    const next = toggleFavoriteId(favorites, product.id);
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); }
    catch { notify("Guardado durante esta visita. Este navegador no permite conservar los favoritos."); }
  }
  useEffect(() => {
    try { setFavorites(readFavoriteIds(localStorage.getItem(FAVORITES_KEY))); } catch {}
    setFavoritesReady(true);
    function syncFavorites(event: StorageEvent) {
      if (event.key === FAVORITES_KEY || event.key === null) setFavorites(readFavoriteIds(event.newValue));
    }
    window.addEventListener('storage', syncFavorites);
    return () => window.removeEventListener('storage', syncFavorites);
  }, []);
  function notify(text: string) {
    setToast(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setToast(""), 4500);
  }
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("chinafu-design-cart-v1") || "{}",
      );
      if (Array.isArray(saved.cart))
        setCart(
          saved.cart.filter(
            (i: CartItem) =>
              allProducts.some((p) => p.id === i.product_id) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 20 &&
              (i.variant_id === null ||
                catalog.variants.some(
                  (v) => v.id === i.variant_id && v.product_id === i.product_id,
                )),
          ),
        );
      if (catalog.branches.some((b) => b.id === saved.branchId))
        setBranch(saved.branchId);
      if (saved.mode === "Delivery" || saved.mode === "Recojo")
        setMode(saved.mode);
    } catch {}
    setReady(true);
    const params = new URLSearchParams(location.search);
    if (params.get("buscar")) setQuery(params.get("buscar")!);
    if (params.get("categoria") === "Favoritos" || categories.some((c) => c.id === params.get("categoria")))
      setCategory(params.get("categoria")!);
    return () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); };
  }, [catalog]);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        "chinafu-design-cart-v1",
        JSON.stringify({ cart, branchId, mode }),
      );
    } catch {}
  }, [cart, branchId, mode, ready]);
  useEffect(() => {
    const pref = matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    function setup() {
      observer?.disconnect();
      document.body.classList.toggle("motion-enabled", !pref.matches);
      mainRef.current
        ?.querySelectorAll(".reveal")
        .forEach((el) => el.classList.remove("reveal-pending"));
      if (pref.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("reveal-pending");
              observer?.unobserve(entry.target);
            }
          }),
        { threshold: 0.05 },
      );
      mainRef.current?.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("reveal-pending");
        observer?.observe(el);
      });
    }
    setup();
    pref.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      pref.removeEventListener("change", setup);
    };
  }, []);
  function updateFilter(id: string, q = query) {
    setMenuPage(1);
    setCategory(id);
    const u = new URL(location.href);
    id === "Todos"
      ? u.searchParams.delete("categoria")
      : u.searchParams.set("categoria", id);
    q ? u.searchParams.set("buscar", q) : u.searchParams.delete("buscar");
    history.replaceState(null, "", u);
  }
  function add(product: Product, variant: string | null = null) {
    if (uncertain) {
      notify("Reintenta el pedido anterior antes de modificar tu selección.");
      return;
    }
    setCart((items) => {
      const found = items.find(
        (i) => i.product_id === product.id && i.variant_id === variant,
      );
      return found
        ? items.map((i) =>
            i === found ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i,
          )
        : [
            ...items,
            { product_id: product.id, variant_id: variant, quantity: 1 },
          ];
    });
    setUndo(null);
    notify(product.name + " agregado");
    const badge = document.querySelector("#count");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      badge?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.25)" },
          { transform: "scale(1)" },
        ],
        { duration: 300 },
      );
  }
  function choose(product: Product) {
    const options = product.combo ? [] : catalog.variants.filter((v) => v.product_id === product.id);
    if (!options.length) {
      add(product);
      return;
    }
    setSelected(product);
    setVariant(options[0].id);
    setPanel("product");
  }
  function quantity(index: number, delta: number) {
    if (uncertain) return;
    setUndo(cart);
    setCart((items) =>
      items
        .map((i, n) =>
          n === index
            ? { ...i, quantity: Math.min(20, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }
  function openCheckout() {
    if(unavailableCart){notify("Una oferta ya no está disponible. Retírala del carrito antes de continuar.");return;}
    setPanel("checkout");
  }
  function close() {
    if (busy) return;
    setPanel("");
  }
  const branchName = branch?.name || "Elige tu local";
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <div className="note">PROPUESTA DE DISEÑO · No se reciben pedidos ni pagos</div>
      <header>
        <Link className="logo" href="/">
          <span className="seal" aria-hidden="true">
            福
          </span>
          <span>
            CHINA FU<small>CHIFA · SABOR QUE REÚNE</small>
          </span>
        </Link>
        <nav aria-label="Principal">
          <a href="#carta">Nuestra carta</a>
          <button className="nav-button" onClick={() => setPanel("location")}>
            Elegir local
          </button>
          <a href="#experiencia">Nuestra esencia</a>

        </nav>
        <button className="restaurant-info-button" aria-label="Información del restaurante" onClick={() => setPanel("restaurant-info")}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg><span>Información</span></button>
        <button className="cartbutton" onClick={() => setPanel("cart")}>
          Mi pedido <span id="count">{count}</span>
        </button>
      </header>
      <main id="contenido" ref={mainRef}>
        <section className="hero">
          <div className="herocopy reveal">
            <span className="eyebrow">DE LA TRADICIÓN A TU MESA</span>
            <span className="hero-calligraphy" aria-hidden="true">
              福 · 味 · 香
            </span>
            <h1>
              El antojo
              <br />
              tiene <em>nombre.</em>
            </h1>
            <p>
              Un buen chaufa. Una mesa compartida.
              <br />
              Ese sabor que siempre te trae de vuelta.
            </p>
            <div className="actions">
              <a className="primary" href="#carta">
                Encuentra tu favorito →
              </a>
              <button
                className="secondary"
                onClick={() => setPanel("location")}
              >
                Elegir mi local
              </button>
            </div>
            <p className="small-copy">Explora primero. Sin crear una cuenta.</p>
          </div>
          <figure className="heroart reveal">
            <img
              src="/food-concept.webp"
              width={1536}
              height={1024}
              fetchPriority="high"
              alt="Fotografía conceptual de arroz chaufa, pollo agridulce y wantanes"
            />
            <div className="artlabel">
              <small>EL CLÁSICO DE SIEMPRE</small>Chaufa & buena compañía.
            </div>
            <span className="stamp" aria-hidden="true">
              CHINA FU
              <br />
              <b>福</b>
              <br />
              BUEN SABOR
            </span>
            <figcaption>Fotografía conceptual creada con IA</figcaption>
          </figure>
        </section>
        <FeaturedCombos products={allProducts} onAdd={choose} disabled={uncertain}/>
        <section className="service reveal" aria-label="Configura tu pedido">
          <div>
            <strong>¿Dónde lo disfrutas?</strong>
            <span>
              {branchName} · {mode}
            </span>
          </div>
          <div className="mode-switch">
            {["Delivery", "Recojo"].map((m) => (
              <button
                key={m}
                disabled={uncertain}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <button className="local-link" onClick={() => setPanel("location")}>
            Cambiar local →
          </button>
        </section>
        <section className="section" id="carta">
          <div className="sectionhead reveal">
            <div>
              <span className="eyebrow">PARA TODOS LOS ANTOJOS</span>
              <span className="section-seal" aria-hidden="true">
                食
              </span>
              <h2>
                Hoy se come <em>chifa.</em>
              </h2>
            </div>
            <p>
              Desde tu chaufa de siempre hasta un nuevo favorito. Tú eliges.
            </p>
          </div>
          <div className="menu-layout">
            <aside>
              <span className="sidebar-label">EXPLORA LA CARTA</span>
              <div className="filters" aria-label="Categorías">
                {[{ id: "Todos", name: "Todos" }, { id: "Favoritos", name: "Favoritos" }, ...categories].map(
                  (c) => (
                    <button
                      key={c.id}
                      aria-pressed={category === c.id}
                      onClick={() => updateFilter(c.id)}
                    >
                      <span className="category-name">{c.id === "Favoritos" && <HeartIcon />}{c.name}</span>
                      <small aria-hidden="true">
                        {c.id === "Favoritos" ? favoriteCount : (c.id === "Todos" || c.id === recommendedId)
                          ? allProducts.length
                          : allProducts.filter(
                              (p) => p.category_id === c.id,
                            ).length}
                      </small>
                    </button>
                  ),
                )}
              </div>
              <div className="catalog-order">
                <label htmlFor="catalog-order">Ordenar por</label>
                <select id="catalog-order" value={sortOrder} onChange={e => { setSortOrder(e.target.value as CatalogSort); setMenuPage(1); }}>
                  <option value="catalog">Orden de la carta</option>
                  <option value="popular" disabled={!catalog.sortMetricsReady}>Más popular</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="recent" disabled={!catalog.sortMetricsReady}>Más recientes</option>
                </select>
                {!catalog.sortMetricsReady && <small>Popularidad y novedades aún no disponibles.</small>}
              </div>
              <div className="sidebar-note">
                <span aria-hidden="true">福</span>
                <strong>Hecho para compartir.</strong>
                <p>Arma una mesa con tus favoritos.</p>
              </div>
            </aside>
            <div className="menu-content">
              <div className="menu-toolbar">
                <h3>
                  {category === "Todos"
                    ? "Toda la carta"
                    : category === "Favoritos" ? "Mis favoritos" : categories.find((c) => c.id === category)?.name}
                </h3>
                <label className="sr-only" htmlFor="search">
                  Buscar plato
                </label>
                <input
                  className="search"
                  id="search"
                  name="search"
                  type="search"
                  autoComplete="off"
                  placeholder="Busca tu favorito…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    updateFilter(category, e.target.value);
                  }}
                />
              </div>
              {category===COMBO_CATEGORY_ID && !combosReady && <p className="setup-notice">El local aún no ha habilitado sus combos.</p>}
              {category===COMBO_CATEGORY_ID && combosReady && combosError && <p className="setup-notice" role="status">{combosError}</p>}
              <p className="menu-note">
                {category === "Favoritos" ? "Guardados en este navegador. No necesitas una cuenta." : allProducts.some((p) => p.is_demo)
                  ? "Carta de ejemplo · Precios y disponibilidad por confirmar."
                  : "Disponibilidad según local. Consulta los ingredientes antes de pedir."}
              </p>
              <p className="menu-result-count" role="status" aria-live="polite" id="menu-results-title" tabIndex={-1}>
                {visible.length ? "Mostrando " + (pageStart + 1) + "–" + Math.min(pageStart + pageSize, visible.length) + " de " + visible.length + " platos" : "0 platos"}
              </p>
              <div className="grid menu-grid" key={category + currentPage + sortOrder}>
                <>
                  {pageProducts.map((p, index) => (
                    <article
                      className="dish dish--compact"
                      key={p.id}
                      style={
                        {
                          "--enter-delay": `${Math.min(index, 8) * 35}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <button type="button" className="dish-favorite" aria-pressed={favorites.includes(p.id)}
                        aria-label={(favorites.includes(p.id) ? "Quitar " : "Guardar ") + p.name + (favorites.includes(p.id) ? " de favoritos" : " en favoritos")}
                        disabled={!favoritesReady} onClick={() => toggleFavorite(p)}>
                        <HeartIcon filled={favorites.includes(p.id)} />
                      </button>
                      {p.combo && <span className="combo-card-badge">COMBO</span>}
                      <DishPhoto name={p.combo?.image_name||p.name} category={p.combo?.image_category||categories.find(c => c.id === p.category_id)?.name || ""} imageUrl={p.image_url} />
                      <span className="eyebrow">
                        {
                          categories.find((c) => c.id === p.category_id)
                            ?.name
                        }
                      </span>
                      <h4>{p.name}</h4>
                      <p>{p.description}</p>
                      {p.combo && Number(p.combo.normal_price)>Number(p.price) && <p className="combo-card-saving"><del>{money(Number(p.combo.normal_price))}</del> por separado · Ahorras {money(comboDiscount(Number(p.price),Number(p.combo.normal_price)))}</p>}
                      <div className="dishfooter">
                        <strong>
                          {catalog.variants.some((v) => v.product_id === p.id)
                            ? "Desde "
                            : ""}
                          {money(
                            catalog.variants.some((v) => v.product_id === p.id)
                              ? Math.min(
                                  ...catalog.variants
                                    .filter((v) => v.product_id === p.id)
                                    .map((v) => Number(v.price)),
                                )
                              : Number(p.price),
                          )}
                        </strong>
                        <button
                          disabled={uncertain}
                          onClick={() => choose(p)}
                          aria-label={`Agregar ${p.name}`}
                        >
                          Agregar +
                        </button>
                      </div>
                    </article>
                  ))}
                </>
                {!visible.length && (
                  <div className="empty">
                    <h3>{category === "Favoritos" && !favoriteCount ? "Marca platos que te gusten." : category===COMBO_CATEGORY_ID&&!query?"Pronto, más para compartir.":"No encontramos ese plato."}</h3>
                    <p>{category === "Favoritos" && !favoriteCount ? "Toca el corazón de un plato y lo encontrarás aquí." : category===COMBO_CATEGORY_ID&&!query?"El local aún no tiene combos disponibles. Explora los platos de la carta.":"Prueba otra búsqueda o categoría."}</p>
                    <button
                      className="primary"
                      onClick={() => {
                        setQuery("");
                        updateFilter("Todos", "");
                      }}
                    >
                      Ver toda la carta
                    </button>
                  </div>
                )}
              </div>
              {pageCount > 1 && (
                <nav className="menu-pagination" aria-label="Páginas de platos">
                  <button disabled={currentPage === 1} onClick={() => changeMenuPage(currentPage - 1)} aria-label="Página anterior">← Anterior</button>
                  <label>
                    <span className="sr-only">Elegir página de platos</span>
                    <select value={currentPage} onChange={(e) => changeMenuPage(Number(e.target.value))}>
                      {Array.from({ length: pageCount }, (_, i) => <option key={i + 1} value={i + 1}>Página {i + 1} de {pageCount}</option>)}
                    </select>
                  </label>
                  <button disabled={currentPage === pageCount} onClick={() => changeMenuPage(currentPage + 1)} aria-label="Página siguiente">Siguiente →</button>
                </nav>
              )}
            </div>
          </div>
        </section>
        <section className="essence" id="experiencia">
          <div
            className="essence-art reveal"
            role="img"
            aria-label="Arte oficial China Fu, dragón y flores"
          />
          <div className="reveal">
            <span className="eyebrow">DOS CULTURAS. UNA MESA.</span>
            <h2>
              Hay sabores
              <br />
              que nos <em>reúnen.</em>
            </h2>
            <p>
              El chifa es encuentro: el wok, el arroz y la costumbre de
              compartir. Deja que tu próximo antojo nos reúna alrededor de la
              mesa.
            </p>
            <a className="text-link" href="#carta">
              Arma tu mesa →
            </a>
          </div>
        </section>
        <section className="appsection">
          <div className="reveal">
            <span className="eyebrow">TU ANTOJO, SIN COMPLICACIONES</span>
            <h2>
              Un pedido fácil.
              <br />
              <em>A tu manera.</em>
            </h2>
            <p>
              Explora desde tu celular y arma tu selección. Descubre cómo se verá la nueva experiencia de compra.
            </p>
            <button className="primary" onClick={() => setPanel("cart")}>Probar mi selección</button>
            <p className="small-copy">
              Esta demostración no solicita registro ni procesa pagos.
            </p>
          </div>
          <div className="phone reveal">
            <div className="phone-logo">
              CHINA FU <span aria-hidden="true">福</span>
            </div>
            <small>DE NUESTRA COCINA A TU MESA</small>
            <h3>
              Tu antojo
              <br />
              está en marcha.
            </h3>
            <p>Un estado claro en cada paso.</p>
            <ol className="steps">
              <li>
                <b>01</b> Pedido recibido
              </li>
              <li>
                <b>02</b> Confirmado por el local
              </li>
              <li>
                <b>03</b> En preparación
              </li>
              <li>
                <b>04</b> Listo / entregado
              </li>
            </ol>
            <small>Estados ilustrativos hasta configurar el servicio.</small>
          </div>
        </section>
        <section className="help-section" aria-labelledby="help-title">
          <div className="help-heading"><span className="eyebrow">ANTES DE ELEGIR</span><h2 id="help-title">Todo más <em>claro.</em></h2><p>Una buena mesa empieza sin dudas. Encuentra lo que necesitas antes de elegir tu próximo antojo.</p><span className="help-signature" aria-hidden="true">福 <i/> SABOR QUE REÚNE</span></div>
          <div className="help-options">
            <button className="help-option" onClick={()=>setPanel("faq-help")}><span className="help-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M10 9a2 2 0 0 1 4 0c0 1-2 1-2 3M12 14v.2"/></svg></span><span><strong>Preguntas frecuentes</strong><small>Pedidos, pagos y entregas, paso a paso.</small></span><span className="help-arrow" aria-hidden="true">↗</span></button>
            <button className="help-option" onClick={()=>setPanel("restaurant-info")}><span className="help-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span><strong>Encuentra tu local</strong><small>Consulta la información de nuestras sedes.</small></span><span className="help-arrow" aria-hidden="true">↗</span></button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main"><div className="footer-brand"><a className="logo" href="#contenido"><span className="footer-seal" aria-hidden="true">福</span><span>CHINA FU<small>CHIFA · SABOR QUE REÚNE</small></span></a><p>Dos culturas. Una mesa.<br/>El gusto de compartir.</p></div><nav className="footer-navigation" aria-label="Explora China Fu"><span className="footer-label">A TU GUSTO</span><a href="#carta">Nuestra carta</a><a href="#experiencia">Nuestra esencia</a><button onClick={()=>setPanel("location")}>Elegir local</button></nav><nav className="footer-navigation" aria-label="Ayuda y locales"><span className="footer-label">ESTAMOS CERCA</span><button onClick={()=>setPanel("restaurant-info")}>Información del restaurante</button><button onClick={()=>setPanel("faq-help")}>Preguntas frecuentes</button><a className="footer-top" href="#contenido">Volver arriba <span aria-hidden="true">↑</span></a></nav></div>
        <div className="footer-bottom"><p>CHINA FU · Propuesta de rediseño</p><p>Imágenes referenciales · Demostración sin pedidos ni pagos</p></div>
      </footer>
      <nav className="mobilemenu" aria-label="Navegación móvil">
        <a href="#carta">Carta</a>
        <button onClick={() => setPanel("location")}>Local</button>
        <button onClick={() => setPanel("cart")}>Pedido ({count})</button>
        <button onClick={() => setPanel("restaurant-info")}>Información</button>
      </nav>
      <Modal
        open={panel === "cart"}
        onClose={close}
        title="Un buen antojo."
        id="cart-panel"
        drawer
      >
        <p>
          {demo
            ? "Carrito de demostración · No se envía un pedido."
            : "Revisa tu selección antes de enviar."}
        </p>
        <div id="cartitems">
          {cart.map((i, index) => {
            const d = itemDetails(i);
            return (
              <article
                className="cartrow"
                key={i.product_id + (i.variant_id || "")}
              >
                <div>
                  <h3>{d.name}</h3>
                  <small>{money(d.price)} por {d.product?.combo?"combo":"plato"}</small>
                  {!d.product && <button className="plain-link" disabled={uncertain} onClick={()=>setCart(items=>items.filter((_,n)=>n!==index))}>Retirar del carrito</button>}
                  {d.product?.combo && <><p className="cart-combo-details">Incluye: {d.product.combo.included_names?.join(" + ")}</p><small>Selección fija · Sin cambios de platos</small></>}
                </div>
                <div className="quantity">
                  <button
                    disabled={uncertain}
                    aria-label={`Reducir cantidad de ${d.name}`}
                    onClick={() => quantity(index, -1)}
                  >
                    −
                  </button>
                  <span>{i.quantity}</span>
                  <button
                    disabled={i.quantity >= 20 || uncertain || !d.product}
                    aria-label={`Aumentar cantidad de ${d.name}`}
                    onClick={() => quantity(index, 1)}
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
          {!count && (
            <div className="empty">
              <h3>Tu antojo empieza aquí.</h3>
              <p>Elige un plato de la carta.</p>
            </div>
          )}
        </div>
        {undo && !uncertain && (
          <button
            className="continue"
            onClick={() => {
              setCart(undo);
              setUndo(null);
            }}
          >
            Deshacer último cambio
          </button>
        )}
        <div className="cart-bottom">
          <div className="total">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <p>Subtotal ilustrativo. Envío y pagos no están conectados en esta demo.</p>
          {unavailableCart && <p className="form-error" role="alert">Una oferta de tu carrito ya no está disponible. Retírala antes de continuar.</p>}
          <button className="primary" disabled={!count||unavailableCart} onClick={openCheckout}>
            Ver resumen →
          </button>
          <button className="continue" onClick={close}>
            Seguir explorando
          </button>
        </div>
      </Modal>
      <Modal open={panel === "faq-help"} onClose={close} title="Preguntas frecuentes" id="faq-help">
        {panel === "faq-help" && <><p className="faq-intro">Un poco de ayuda antes de disfrutar tu pedido.</p>{demo && <p className="setup-notice">Estás en modo de prueba. Los pedidos reales todavía no están habilitados.</p>}<div className="faq-accordion">{(catalog.faqs ?? []).map(item=><details key={item.id}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>{(catalog.faqs ?? []).length===0 && <p>El local aún no ha publicado preguntas frecuentes. Consulta su información de contacto.</p>}<button className="plain-link" onClick={()=>setPanel("restaurant-info")}>Consultar información del local →</button></>}
      </Modal>
      <Modal open={panel === "restaurant-info"} onClose={close} title="Información del restaurante" id="restaurant-info">
        {panel === "restaurant-info" && <RestaurantInfo branches={catalog.branches} branchId={branchId} onSelect={setBranch} />}
      </Modal>
      <Modal
        open={panel === "location"}
        onClose={close}
        title="Elige tu local."
        id="location"
      >
        <div className="form-stack">
          <label>
            Local
            <select
              disabled={uncertain}
              value={branchId}
              onChange={(e) => setBranch(e.target.value)}
            >
              {catalog.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <p>{branch?.address}</p>
          {branch?.is_demo && (
            <p className="setup-notice">
              Local de referencia. Dirección y cobertura por confirmar.
            </p>
          )}
          <button className="primary" onClick={close}>
            Guardar selección
          </button>
        </div>
      </Modal>
      <Modal
        open={panel === "product"}
        onClose={close}
        title={selected?.name || "Elige tu plato"}
        id="product"
      >
        <p>{selected?.description}</p>
        <div className="form-stack">
          <label>
            Variante
            <select
              value={variantId}
              onChange={(e) => setVariant(e.target.value)}
            >
              {catalog.variants
                .filter((v) => v.product_id === selected?.id)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {money(Number(v.price))}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="primary"
            onClick={() => {
              if (selected) {
                add(selected, variantId);
                close();
              }
            }}
          >
            Agregar al pedido
          </button>
        </div>
      </Modal>
      <Modal open={panel==="checkout"} onClose={close} title="Tu selección." id="checkout"><p>Vista de demostración. No se envía ningún pedido ni se realiza un cobro.</p><ul>{cart.map((item,index)=><li key={index}>{item.quantity} × {itemDetails(item).name} · {money(itemDetails(item).price*item.quantity)}</li>)}</ul><div className="total"><span>Subtotal referencial</span><strong>{money(subtotal)}</strong></div><p>La dirección, cobertura, costo de envío y métodos de pago se conectarán al sistema del cliente durante la integración.</p><button className="primary" onClick={()=>{setPanel("cart");notify("Demostración completada. No se guardó ningún pedido.");}}>Volver a mi selección</button></Modal>
      <div className="toast" role="status" aria-live="polite" hidden={!toast}>
        {toast}
      </div>
    </>
  );
}
