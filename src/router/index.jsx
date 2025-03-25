import { createHashRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Posts from "../pages/Posts";
import ProtectedRoute from "../components/ProtectedRoute";

const routes = [
    {path:"/", element: <Home/>},
    {path: "/index.html", element:<Home/>},
    {path: "/posts", element: <ProtectedRoute><Posts/></ProtectedRoute>}
];


const router = createHashRouter([{
    path:"/",
    element:<App/>,
    children: routes.map((route)=>{
        return {
            index: route.path === "/",
            path: route.path === "/" ? undefined : route.path,
            element: route.element
        }
    })
}]);

export default router;