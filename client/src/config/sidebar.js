import {
  FaUser, FaBoxOpen, FaPlus, FaList,
  FaShoppingCart, FaHeart, FaCog,
  FaMapMarkerAlt, FaUsers, FaWarehouse
} from 'react-icons/fa';

const sidebarConfig = {
  admin: [
    {
      label: 'Thông tin quản trị',
      path: '/admin/dashboard',
      icon: FaUser
    },
    {
      label: 'Quản lý người dùng',
      icon: FaUsers,
      children: [
        { label: 'Danh sách người dùng', path: '/admin/users', icon: FaList },
        { label: 'Thêm người dùng', path: '/admin/users/add', icon: FaPlus }
      ]
    },
    {
      label: 'Quản lý sản phẩm',
      icon: FaBoxOpen,
      children: [
        { label: 'Danh sách sản phẩm', path: '/admin/product_list', icon: FaList },
        { label: 'Thêm sản phẩm', path: '/admin/product_add', icon: FaPlus }
      ]
    },
    {
      label: 'Quản lý kho hàng',
      icon: FaWarehouse,
      children: [
        { label: 'Danh sách kho', path: '/admin/inventory', icon: FaList },
        { label: 'Thêm kho', path: '/admin/inventory/add', icon: FaPlus }
      ]
    },
    {
      label: 'Đơn hàng',
      path: '/admin/orders',
      icon: FaShoppingCart
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
      icon: FaUser
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
