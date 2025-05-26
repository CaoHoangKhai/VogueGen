import {
  FaUsers, FaUserPlus, FaBoxOpen,
  FaWarehouse, FaGift, FaHeart,
  FaCog, FaShoppingCart, FaMapMarkerAlt
} from 'react-icons/fa';
import { MdDashboard, MdCategory, MdOutlineCampaign } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BiSolidUserAccount } from "react-icons/bi";
import { RiShoppingBag3Fill } from "react-icons/ri";

const sidebarConfig = {
  admin: [
    {
      label: 'Trang tổng quan',
      path: '/admin/dashboard',
      icon: MdDashboard
    },
    {
      label: 'Quản lý người dùng',
      icon: FaUsers,
      children: [
        { label: 'Danh sách người dùng', path: '/admin/user_list', icon: HiOutlineClipboardList },
        { label: 'Thêm người dùng', path: '/admin/user_add', icon: FaUserPlus }
      ]
    },
    {
      label: 'Quản lý sản phẩm',
      icon: FaBoxOpen,
      children: [
        { label: 'Danh sách sản phẩm', path: '/admin/product_list', icon: HiOutlineClipboardList },
        { label: 'Thêm sản phẩm', path: '/admin/product_add', icon: IoMdAddCircle },
        { label: 'Thêm danh mục', path: '/admin/cacategory_add', icon: MdCategory }
      ]
    },
    {
      label: 'Quản lý kho hàng',
      icon: FaWarehouse,
      children: [
        { label: 'Danh sách kho', path: '/admin/inventory', icon: HiOutlineClipboardList },
        { label: 'Thêm kho', path: '/admin/inventory/add', icon: IoMdAddCircle }
      ]
    },
    {
      label: 'Quản lý tin tức',
      icon: MdOutlineCampaign,
      children: [
        { label: 'Danh sách tin tức', path: '/admin/news', icon: HiOutlineClipboardList },
        { label: 'Thêm tin tức', path: '/admin/news/add', icon: IoMdAddCircle }
      ]
    },
    {
      label: 'Quản lý khuyến mãi',
      icon: FaGift,
      children: [
        { label: 'Danh sách khuyến mãi', path: '/admin/promotions', icon: HiOutlineClipboardList },
        { label: 'Thêm khuyến mãi', path: '/admin/promotions/add', icon: IoMdAddCircle }
      ]
    },
    {
      label: 'Đơn hàng',
      path: '/admin/orders',
      icon: RiShoppingBag3Fill
    },
    {
      label: 'Sản phẩm nổi bật',
      path: '/admin/highlighted-products',
      icon: FaHeart
    },
    {
      label: 'Cài đặt hệ thống',
      path: '/admin/settings',
      icon: FaCog
    }
  ],

  user: [
    {
      label: 'Thông tin cá nhân',
      path: '/user/profile',
      icon: BiSolidUserAccount
    },
    {
      label: 'Sản phẩm của tôi',
      path: '/user/my-products',
      icon: FaBoxOpen
    },
    {
      label: 'Giỏ hàng',
      path: '/user/cart',
      icon: FaShoppingCart
    },
    {
      label: 'Địa chỉ nhận hàng',
      path: '/user/location',
      icon: FaMapMarkerAlt
    },
    {
      label: 'Yêu thích',
      path: '/user/favorites',
      icon: FaHeart
    },
    {
      label: 'Cài đặt',
      path: '/user/settings',
      icon: FaCog
    }
  ]
};

export default sidebarConfig;
