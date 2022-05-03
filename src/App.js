import React from "react";
import axios from "axios";
import { Route } from "react-router-dom";
import Drawer from "./components/Drawer";
import Header from "./components/Header";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";

export const AppContext = React.createContext({});

function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [cartOpened, setCartOpened] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // получение данных с сервера (mockAPI)
  React.useEffect(() => {
    async function fetchData() {
      const cartResponse = await axios.get(
        "https://623b173346a692bd844e3fec.mockapi.io/cart"
      );
      const favoritesResponse = await axios.get(
        "https://623b173346a692bd844e3fec.mockapi.io/favorites"
      );
      const itemsResponse = await axios.get(
        "https://623b173346a692bd844e3fec.mockapi.io/items"
      );

      setIsLoading(false);

      // порядок отображения элементов главной страницы
      setCartItems(cartResponse.data);
      setFavorites(favoritesResponse.data);
      setItems(itemsResponse.data);
    }

    fetchData();
  }, []);

  // добавление в корзину
  const onAddToCart = (obj) => {
    console.log(obj);
    if (cartItems.find((item) => Number(item.id) === Number(obj.id))) {
      // если в корзине уже есть товар - удаляем
      axios.delete(
        `https://623b173346a692bd844e3fec.mockapi.io/cart/${obj.id}`
      );
      setCartItems((prev) =>
        prev.filter((item) => Number(item.id) !== Number(obj.id))
      );
    } else {
      axios.post("https://623b173346a692bd844e3fec.mockapi.io/cart", obj);
      setCartItems((prev) => [...prev, obj]);
    }
  };

  // удаление из корзины
  const onRemoveItem = (id) => {
    axios.delete(`https://623b173346a692bd844e3fec.mockapi.io/cart/${id}`);
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // добавление в закладки
  const onAddToFavorite = async (obj) => {
    try {
      // проверка на то, есть ли у нас уже в избранном товар
      if (favorites.find((favObj) => favObj.id === obj.id)) {
        axios.delete(
          `https://623b173346a692bd844e3fec.mockapi.io/favorites/${obj.id}`
        );
      } else {
        const { data } = await axios.post(
          "https://623b173346a692bd844e3fec.mockapi.io/favorites",
          obj
        );
        setFavorites((prev) => [...prev, data]);
      }

      // если запрос не отправится, приложение ляжет
    } catch (error) {
      alert("Не удалось добавить в фавориты");
    }
  };

  // реализация поиска
  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <AppContext.Provider value={{ items, cartItems, favorites }}>
      <div className="wrapper clear">
        {cartOpened && (
          <Drawer
            items={cartItems}
            onClose={() => setCartOpened(false)}
            onRemove={onRemoveItem}
          />
        )}
        <Header onClickCart={() => setCartOpened(true)} />
        <Route path="/" exact>
          <Home
            items={items}
            cartItems={cartItems}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onChangeSearchInput={onChangeSearchInput}
            onAddToFavorite={onAddToFavorite}
            onAddToCart={onAddToCart}
            isLoading={isLoading}
          />
        </Route>
        <Route path="/favorites" exact>
          <Favorites onAddToFavorite={onAddToFavorite} />
        </Route>
      </div>
    </AppContext.Provider>
  );
}

export default App;
