import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Components/Login'
import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Home from './Components/Home'
import Employee from './Components/Employee'
import Category from './Components/Category'
import Profile from './Components/Profile'
import AddCategory from './Components/AddCategory'
import AddEmployee from './Components/AddEmployee'
import EditEmployee from './Components/EditEmployee'
import Start from './Components/Start'
import EmployeeLogin from './Components/EmployeeLogin'
import EmployeeDetail from './Components/EmployeeDetail'
import PrivateRoute from './Components/PrivateRoute'
import Accounts from './Components/Accounts/Accounts'
import AddAccount from './Components/Accounts/AddAccount'
import AccountDetails from './Components/Accounts/AccountDetails'
import Transactions from './Components/Transactions/Transactions'
import AddTransaction from './Components/Transactions/AddTransaction'
import TransactionDetails from './Components/Transactions/TransactionDetails'
import Products from './Components/Products/Products'
import AddProduct from './Components/Products/AddProduct'
import ProductDetails from './Components/Products/ProductDetails'
import BuySell from './Components/BuySell/BuySell'
import BuySellForm from './Components/BuySell/BuySellForm'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Start />}></Route>
      <Route path='/adminlogin' element={<Login />}></Route>
      <Route path='/employee_login' element={<EmployeeLogin />}></Route>
      <Route path='/employee_detail/:id' element={<EmployeeDetail />}></Route>
      <Route path='/dashboard' element={
        <PrivateRoute >
          <Dashboard />
        </PrivateRoute>
      }>
        <Route path='' element={<Home />}></Route>
        <Route path='/dashboard/employee' element={<Employee />}></Route>
        <Route path='/dashboard/accounts' element={<Accounts />}></Route>
        <Route path='/dashboard/accounts' element={<Accounts />}></Route>
        <Route path='/dashboard/accounts/addAccount' element={<AddAccount />}></Route>
        <Route path='/dashboard/accounts/details/:id' element={<AccountDetails />}></Route>
        <Route path='/dashboard/transactions' element={<Transactions />}></Route>
        <Route path='/dashboard/transactions/addTransaction' element={<AddTransaction />}></Route>
        <Route path='/dashboard/transactions/details/:id' element={<TransactionDetails />}></Route>

        <Route path='/dashboard/products' element={<Products />}></Route>
        <Route path='/dashboard/products/addProduct' element={<AddProduct />}></Route>
        <Route path='/dashboard/products/details/:id' element={<ProductDetails />}></Route>

        <Route path='/dashboard/buysell' element={<BuySell />}></Route>
        <Route path='/dashboard/buysell/buysellform' element={<BuySellForm />}></Route>











        <Route path='/dashboard/category' element={<Category />}></Route>
        <Route path='/dashboard/profile' element={<Profile />}></Route>
        <Route path='/dashboard/add_category' element={<AddCategory />}></Route>
        <Route path='/dashboard/add_employee' element={<AddEmployee />}></Route>
        <Route path='/dashboard/edit_employee/:id' element={<EditEmployee />}></Route>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
