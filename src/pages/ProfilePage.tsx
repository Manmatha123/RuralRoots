import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AddressForm from '@/components/AddressForm';
import ProductForm from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { Address, Order, Product, User } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';
import { MapPin, ShoppingBag, Box, Plus, Edit, Package, User as UserIcon, Phone, Image, FileX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import axios from 'axios';
import OrderDetailsDialog from '@/components/OrderDetailsDialog';
import { format } from 'date-fns';
import GenerateBill from '@/components/GenerateBill';

const ProfilePage = () => {
  const { token, isAuthenticated } = useAuth();
  const { getProductsByOwnerId, getOrdersByBuyerId, getOrdersBySellerId,
    addProduct, updateProduct, deleteProduct, updateOrderStatus } = useProducts();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('my-orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const baseUrl = 'http://localhost:8083';
  const userData = user;
  const [ownerProduct, setOwnerProduct] = useState<Product[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  const [isbillOpen, setIsBillOPen] = useState(false);
  const [billOrder, setBillOrder] = useState<Order>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
    }
    getUserInfo();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
    }
    getUserInfo();
    getOwnerproduct();

  }, []);


  const getUserInfo = async () => {
    try {
      let authToken = localStorage.getItem('authToken');
      authToken = JSON.parse(authToken);
      const res = await axios.get(`${baseUrl}/v1/api/user/info`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      if (res.data && res.data?.role == "seller") {
        fetchReceiveOrder(res.data.id);
        setActiveTab('orders-received')
      }
      if (res.data && res.data?.role === "buyer") {
        fetchMyOrders(res.data.id);
      }
    } catch (error) {

    }
  }

  const fetchReceiveOrder = async (id: any) => {
    try {
      let authToken = localStorage.getItem('authToken');
      authToken = JSON.parse(authToken);
      const res = await axios.get(`${baseUrl}/v1/api/order/list/store/id/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
      setSellerOrders(res.data);

    } catch (error) {

    }
  }

  const fetchMyOrders = async (id: any) => {
    try {
      let authToken = localStorage.getItem('authToken');
      authToken = JSON.parse(authToken);
      const res = await axios.get(`${baseUrl}/v1/api/order/list/user/id/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
      setBuyerOrders(res.data);

    } catch (error) {

    }
  }




  const getOwnerproduct = async () => {
    try {
      let authToken = localStorage.getItem('authToken');
      authToken = JSON.parse(authToken);
      const res = await axios.get(`${baseUrl}/v1/api/product/owner-products`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setOwnerProduct(res.data);
    } catch (error) {

    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  useEffect(() => {
    if (editingProduct) {
      setShowProductForm(true);
    }
  }, [editingProduct]);

  const handleUpdateProduct = async (updatedProduct: Omit<Product, 'id'>, imgfile: File) => {
    let product: Product = {
      ...updatedProduct,
      id: editingProduct?.id || null,
    }
    if (editingProduct) {
      product = {
        ...editingProduct,
        ...updatedProduct
      }
    }

    const formData = new FormData();

    if (imgfile && imgfile.size > 0) {
      formData.append('file', imgfile);
    } else {
      console.warn('No image file provided or file is empty. Adding an empty image placeholder.');
      const emptyImage = new Blob([], { type: 'image/png' }); // Create an empty image file
      formData.append('file', emptyImage, 'placeholder.png'); // Append it with a default name
    }

    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

    await updateProduct(formData);
    getOwnerproduct();

  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
      getOwnerproduct();
    }
  };

  const handleConfirmOrder = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    fetchReceiveOrder(user.id);
  };
  // pending' | 'confirmed' | 'delivered' | 'cancelled';
  const handleSaveProduct = (product: Omit<Product, 'id'>, imgfile: File) => {
    // if (editingProduct) {

    handleUpdateProduct({ ...product, seller: user }, imgfile);

    // } else {
    // handleAddProduct(product);
    // }

  };
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const downloadBill = (order: Order) => {
    setBillOrder(order);
    setIsBillOPen(true);
  }

  const onBillClose = () => {
    setIsBillOPen(false);
    setBillOrder(null);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-orders':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Orders</h2>
            {buyerOrders.length > 0 ? (
              buyerOrders.map(order => (
                <Card key={order.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                      <div className="h-20 w-20 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={`data:image/jpeg;base64,${order?.orderProducts[0]?.product?.image}`}
                          alt="orderdata"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1501162946741-4960f990fdf4?w=500&auto=format&fit=crop&q=60";
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">OrderId ORD-00000{order.id}</h3>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                              order.status === 'confirmed' ? 'secondary' :
                                'outline'
                          }>
                            {order.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Seller Contact: <a href={`tel:${order?.seller?.phone}`} className="text-blue-500 hover:underline">
                            {order?.seller?.phone}
                          </a>

                        </p>
                        <p className="text-sm text-gray-500">
                          Total: ₹{order.finalprice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ordered on {format(new Date(order.orderdate), "PPP")}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-xs flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {order.locality},{order.city},{order.district},{order.state},{order.pincode}
                          </p>
                          <Button size="sm" onClick={() => handleViewOrder(order)}>
                            View Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            )}
          </div>
        );

      case 'info':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Information</h2>
            </div>
            <Card className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {user.locality}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.city},{user.district},{user.state},{user.pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'orders-received':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Orders Received</h2>
            {sellerOrders.length > 0 ? (
              sellerOrders.map(order => (
                <Card key={order.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                      <div className="h-20 w-20 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={`data:image/jpeg;base64,${order?.orderProducts[0]?.product?.image}`}
                          alt="orderdata"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1501162946741-4960f990fdf4?w=500&auto=format&fit=crop&q=60";
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">OrderId ORD-00000{order.id}</h3>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                              order.status === 'confirmed' ? 'secondary' :
                                order.status === 'cancelled' ? 'destructive' :
                                  'outline'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Buyer Contact: <a href={`tel:${order?.buyer?.phone}`} className="text-blue-500 hover:underline">
                            {order?.buyer?.phone}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: ₹{order.finalprice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ordered on {format(new Date(order.orderdate), "PPP")}
                        </p>
                        <div className="mt-2 flex justify-between items-center" style={{display:"flex",flexWrap:"wrap"}}>
                          <p className="text-xs flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {order.locality}, {order.city}, {order.district}, {order.state}, {order.pincode}
                          </p>
                          <div className="mt-2 flex justify-between gap-2 items-center">
                            {order.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleConfirmOrder(order.id, 'confirmed')}> Confirm</Button>
                                <Button size="sm" style={{ background: "red" }} onClick={() => handleConfirmOrder(order.id, 'cancelled')}>Cancel</Button>
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <>
                                <Button size="sm" onClick={() => handleConfirmOrder(order.id, 'delivered')}> Deliver</Button>
                              </>
                            )}

                            <Button size="sm" onClick={() => handleViewOrder(order)}><i className="fa-regular fa-eye" /></Button>
                            <Button size="sm" onClick={() => downloadBill(order)}><i className="fa-solid fa-file-pdf"></i></Button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">You haven't received any orders yet.</p>
            )}
          </div>
        );

      case 'my-products':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Products</h2>
              <Button size="sm" onClick={() => {
                setEditingProduct({} as Product);
                setShowProductForm(true);
              }}>
                <Plus size={16} className="mr-1" />
                Add Product
              </Button>
            </div>

            {ownerProduct.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownerProduct.map(product => (
                  <Card key={product.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-24 w-24 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${product.image}`}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1501162946741-4960f990fdf4?w=500&auto=format&fit=crop&q=60";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{product.name}</h3>
                            <Badge>{product?.category?.name}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            ₹{product.price.toFixed(2)} / {product.sellunit}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.description}
                          </p>
                          <div className="mt-2 flex justify-end space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't added any products yet.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  const canSell = user.role === 'seller' || user.role === 'both';
  const canBuy = user.role === 'buyer' || user.role === 'both';

  const handleUpdateProfile = async (updatedProfile: Omit<User, 'id'>) => {
    try {
      const userObj: User = {
        ...updatedProfile,
        id: user.id,
        userAdditional: {
          ...updatedProfile.userAdditional,
          id: user?.userAdditional?.id, // Add the id of userAdditional if it exists
        },
      }
      const res = await axios.post(`${baseUrl}/v1/api/user/update`, userObj, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (res.data.status) {
        toast({
          title: "Success",
          description: "Profile Update successful",
        });
        localStorage.setItem('authToken', JSON.stringify(res.data.message));
        setIsEditProfileOpen(false);
        navigate('/profile');
        navigate(0)
        getUserInfo();
      } else {
        toast({
          title: "Error",
          description: res.data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{user.name}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Mobile: {user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-gray-500" />
                <Badge className="mt-0" variant="outline">
                  {user.role === 'both' ? 'Buyer & Seller' : user.role === 'seller' ? 'Seller' : 'Buyer'}
                </Badge>
              </div>
              {user.locality && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">{user.locality}</span>
                </div>
              )}
              {user.district && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">{user.district}</span>
                </div>
              )}
              {user.city && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">{user.city}, {user.state} {user.pincode}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 border-b overflow-x-auto">
          <div className="flex space-x-6">
            {canBuy && (
              <button
                className={`pb-2 px-1 ${activeTab === 'my-orders' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'} flex items-center`}
                onClick={() => setActiveTab('my-orders')}
              >
                <ShoppingBag size={16} className="mr-2" />
                My Orders
              </button>
            )}
            {canBuy && (
              <button
                className={`pb-2 px-1 ${activeTab === 'info' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'} flex items-center`}
                onClick={() => setActiveTab('info')}
              >
                <MapPin size={16} className="mr-2" />
                My Info
              </button>
            )}
            {canSell && (
              <button
                className={`pb-2 px-1 ${activeTab === 'orders-received' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'} flex items-center`}
                onClick={() => setActiveTab('orders-received')}
              >
                <Package size={16} className="mr-2" />
                Orders Received
              </button>
            )}
            {canSell && (
              <button
                className={`pb-2 px-1 ${activeTab === 'my-products' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'} flex items-center`}
                onClick={() => setActiveTab('my-products')}
              >
                <Box size={16} className="mr-2" />
                My Products
              </button>
            )}
          </div>
        </div>

        <div className="py-4">
          {renderTabContent()}
        </div>
      </main>

      {/* <AddressForm
        address={editingAddress}
        isOpen={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
      /> */}

      <ProductForm
        product={editingProduct}
        isOpen={showProductForm}
        onClose={() => {
          setShowProductForm(false)
          setEditingProduct(null)
        }
        }
        onSave={handleSaveProduct}
      />

      <EditProfileDialog
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleUpdateProfile}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
      {
        isbillOpen && (
          <GenerateBill
            order={billOrder}
            open={isbillOpen}
            onClose={onBillClose}
          />
        )
      }


    </div>
  );
};

export default ProfilePage;
