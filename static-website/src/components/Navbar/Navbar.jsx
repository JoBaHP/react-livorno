import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import images from "../../constants/images";
import "./Navbar.css";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItemCount } from "../../store";
import { clearUser } from "../../store/authSlice";
import { useApi } from "../../ApiProvider";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [toggleMenu, setToggleMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const cartCount = useSelector(selectCartItemCount);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const api = useApi();
  const [activeOrdersCount, setActiveOrdersCount] = React.useState(0);

  const readActiveOrdersCount = React.useCallback(() => {
    try {
      const raw = localStorage.getItem("active_delivery_orders");
      const list = JSON.parse(raw || "[]");
      if (!Array.isArray(list)) {
        setActiveOrdersCount(0);
        return;
      }
      const count = list.filter(
        (o) => o && o.status !== "completed" && o.status !== "declined"
      ).length;
      setActiveOrdersCount(count);
    } catch {
      setActiveOrdersCount(0);
    }
  }, []);

  React.useEffect(() => {
    readActiveOrdersCount();
    const onStorage = (e) => {
      if (e.key === "active_delivery_orders") readActiveOrdersCount();
    };
    const onFocus = () => readActiveOrdersCount();
    const onCustom = () => readActiveOrdersCount();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("active-delivery-orders-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("active-delivery-orders-updated", onCustom);
    };
  }, [readActiveOrdersCount]);

  // Also refresh the badge whenever route changes within the SPA
  React.useEffect(() => {
    readActiveOrdersCount();
  }, [location.pathname, location.search, readActiveOrdersCount]);

  React.useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (event) => {
      if (!event.target.closest(".navbar__userMenu")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(clearUser());
      setShowUserMenu(false);
      navigate("/");
    }
  };

  const goToAccount = () => {
    setShowUserMenu(false);
    navigate("/account");
  };

  const hasCustomAvatar = (url) => {
    if (!url) return false;
    const isGoogle = /^https:\/\/lh3\.googleusercontent\.com\//i.test(url);
    if (!isGoogle) return true;
    return url.includes("/a-/");
  };

  const renderUserAvatar = () => {
    const size = 36;
    if (hasCustomAvatar(user?.picture)) {
      return (
        <img
          src={user.picture}
          alt={user.name || user.username || "User avatar"}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      );
    }
    return <FaUserCircle size={size} color="#DCCA87" />;
  };

  return (
    <>
      {/* Top contact + language bar with golden separator */}
      <div
        className="app__topbar"
        style={{
          background: "var(--color-black)",
          color: "var(--color-white)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0.35rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid var(--color-golden)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <a
              href="tel:+381611970198"
              style={{
                color: "var(--color-white)",
                textDecoration: "none",
                fontWeight: 600,
              }}
              aria-label="Call restaurant 061/197-0198"
            >
              TEL: 061/197-0198
            </a>
            <span style={{ opacity: 0.6, fontSize: 14 }}>
              Bulevar patrijarha Pavla 12, Novi Sad
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => i18n.changeLanguage("en")}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #555",
                background: i18n.language?.startsWith("en")
                  ? "#DCCA87"
                  : "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => i18n.changeLanguage("sr")}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #555",
                background: i18n.language?.startsWith("sr")
                  ? "#DCCA87"
                  : "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
              aria-label="Prebaci na srpski"
            >
              SR
            </button>
            {activeOrdersCount > 0 && (
              <button
                onClick={() => navigate("/delivery/status")}
                className="p__opensans"
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--color-golden)",
                  background: "#1a1a1a",
                  color: "#DCCA87",
                  fontWeight: 700,
                }}
              >
                {t("active_orders.badge", { count: activeOrdersCount })}
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="app__navbar">
        <div
          className="app__navbar-logo"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={images.logo} alt="app__logo" />
        </div>

        <ul className="app__navbar-links">
          <li className="p__opensans">
            <Link to="/">{t("home")}</Link>
          </li>
          <li className="p__opensans">
            <Link to="/#about">{t("about")}</Link>
          </li>
          <li className="p__opensans">
            <button
              type="button"
              className="custom__button"
              onClick={() => navigate("/delivery")}
              aria-label="Go to delivery menu"
            >
              <span>
                <i
                  className="fas fa-utensils"
                  style={{ marginRight: "8px" }}
                ></i>
              </span>
              {t("menu")}
              {cartCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "black",
                    color: "#DCCA87",
                    borderRadius: 12,
                    padding: "2px 6px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </li>
          <li className="p__opensans">
            <Link to="/#awards">{t("experience")}</Link>
          </li>
          <li className="p__opensans">
            <Link to="/#contact">{t("contact")}</Link>
          </li>
          <li className="p__opensans">
            {user ? (
              <div
                className="navbar__userMenu"
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                  }}
                  aria-label={t("account")}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    {renderUserAvatar()}
                  </span>
                </button>
                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      background: "var(--color-black)",
                      border: "1px solid var(--color-golden)",
                      borderRadius: 8,
                      minWidth: 170,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
                      zIndex: 400,
                      padding: 8,
                    }}
                  >
                    {/* <p className="p__opensans" style={{ color: 'var(--color-golden)', marginBottom: 8 }}>
                      {t('account')}
                    </p> */}
                    <button
                      type="button"
                      onClick={goToAccount}
                      className="p__opensans"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {t("account")}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p__opensans"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/account">{t("account")}</Link>
            )}
          </li>
        </ul>
        {/*       <div className="app__navbar-login">
             <a href="#login" className="p__opensans">
          Uloguj se / Registracija
        </a> 
        <div />
        <a href="/" className="p__opensans">
          Rezervišite Sto
        </a>
      </div */}

        <div className="app__navbar-smallscreen">
          <GiHamburgerMenu
            color="#fff"
            fontSize={27}
            onClick={() => setToggleMenu(true)}
          />
          {toggleMenu && (
            <div className="app__navbar-smallscreen_overlay flex__center slide-bottom">
              <MdOutlineRestaurantMenu
                fontSize={27}
                className="overlay__close"
                onClick={() => setToggleMenu(false)}
              />
              <ul className="app__navbar-smallscreen_links">
                <li>
                  <Link to="/" onClick={() => setToggleMenu(false)}>
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link to="/#about" onClick={() => setToggleMenu(false)}>
                    {t("about")}
                  </Link>
                </li>
                <li>
                  <Link to="/delivery" onClick={() => setToggleMenu(false)}>
                    {t("menu")} {cartCount > 0 ? `(${cartCount})` : ""}
                  </Link>
                </li>
                <li>
                  <Link to="/#awards" onClick={() => setToggleMenu(false)}>
                    {t("experience")}
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" onClick={() => setToggleMenu(false)}>
                    {t("contact")}
                  </Link>
                </li>
                <li>
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        className="p__opensans"
                        onClick={() => {
                          setToggleMenu(false);
                          goToAccount();
                        }}
                      >
                        {t("account")}
                      </button>
                      <button
                        type="button"
                        className="p__opensans"
                        onClick={() => {
                          setToggleMenu(false);
                          handleLogout();
                        }}
                      >
                        {t("logout")}
                      </button>
                    </div>
                  ) : (
                    <Link to="/account" onClick={() => setToggleMenu(false)}>
                      {t("account")}
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
