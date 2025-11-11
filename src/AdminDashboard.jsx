import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, Users, UserCog, Menu, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminDashboard = () => {
  // Configuration - Update this with your backend URL
  const API_BASE_URL = 'http://localhost:8080/api'; // Change this to your backend URL
  
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({});

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // API Functions
  const fetchData = async () => {
    setDataLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${activeTab}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      const items = data.data || data[activeTab] || data;
      
      switch (activeTab) {
        case 'doctors':
          setDoctors(Array.isArray(items) ? items : []);
          break;
        case 'appointments':
          setAppointments(Array.isArray(items) ? items : []);
          break;
        case 'users':
          setUsers(Array.isArray(items) ? items : []);
          break;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert(`Error loading ${activeTab}: ${error.message}`, 'error');
      // Set empty arrays on error
      switch (activeTab) {
        case 'doctors':
          setDoctors([]);
          break;
        case 'appointments':
          setAppointments([]);
          break;
        case 'users':
          setUsers([]);
          break;
      }
    } finally {
      setDataLoading(false);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add ${activeTab.slice(0, -1)}`);
      }

      const result = await response.json();
      showAlert(`${activeTab.slice(0, -1)} added successfully!`);
      setIsDialogOpen(false);
      setFormData({});
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Add error:', error);
      showAlert(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const id = editingItem._id || editingItem.id;
      const response = await fetch(`${API_BASE_URL}/${activeTab}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update ${activeTab.slice(0, -1)}`);
      }

      showAlert(`${activeTab.slice(0, -1)} updated successfully!`);
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Update error:', error);
      showAlert(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    try {
      const id = item._id || item.id;
      const response = await fetch(`${API_BASE_URL}/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${activeTab.slice(0, -1)}`);
      }

      showAlert(`${activeTab.slice(0, -1)} deleted successfully!`, 'info');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Delete error:', error);
      showAlert(`Error: ${error.message}`, 'error');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'doctors': return doctors;
      case 'appointments': return appointments;
      case 'users': return users;
      default: return [];
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
  };

  const filteredData = getCurrentData().filter(item =>
    Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'doctors':
        return (
          <>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Dr. John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">rating *</Label>
              <Input id="rating" name="rating" value={formData.rating || ''} onChange={handleInputChange} placeholder="5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Address *</Label>
              <Input id="Address" name="Address" value={formData.Address || ''} onChange={handleInputChange} placeholder="XYZ" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Charge *</Label>
              <Input id="Charge" name="Charge" value={formData.Charge || ''} onChange={handleInputChange} placeholder="1000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Bio *</Label>
              <Input id="Bio" name="Bio" value={formData.Bio || ''} onChange={handleInputChange} placeholder="1000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Avalibility *</Label>
              <Input id="Avalibility" name="Avalibility" value={formData.Avalibility || ''} onChange={handleInputChange} placeholder="Mon - Fri, 9 AM - 3 PM" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">department-Id *</Label>
              <Input id="department-Id" name="department-Id" value={formData.department_Id || ''} onChange={handleInputChange} placeholder="3" required />
            </div>
          
          </>
        );
      case 'appointments':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input id="patientName" name="patientName" value={formData.patientName || ''} onChange={handleInputChange} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name *</Label>
              <Input id="doctorName" name="doctorName" value={formData.doctorName || ''} onChange={handleInputChange} placeholder="Dr. Sarah Johnson" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" name="time" value={formData.time || ''} onChange={handleInputChange} placeholder="10:00 AM" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Input id="status" name="status" value={formData.status || ''} onChange={handleInputChange} placeholder="Scheduled" required />
            </div>
          </>
        );
      case 'users':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="user@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" name="role" value={formData.role || ''} onChange={handleInputChange} placeholder="Patient" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="(555) 123-4567" required />
            </div>
          </>
        );
    }
  };

  const getIcon = (tab) => {
    switch (tab) {
      case 'doctors': return <UserCog className="w-5 h-5" />;
      case 'appointments': return <Calendar className="w-5 h-5" />;
      case 'users': return <Users className="w-5 h-5" />;
    }
  };

  const stats = {
    doctors: doctors.length,
    appointments: appointments.length,
    users: users.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${
            alert.type === 'success' ? 'bg-green-50 border-green-200' : 
            alert.type === 'error' ? 'bg-red-50 border-red-200' : 
            'bg-blue-50 border-blue-200'
          }`}>
            <AlertDescription className={
              alert.type === 'error' ? 'text-red-800' : ''
            }>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {['doctors', 'appointments', 'users'].map((tab) => (
            <Card 
              key={tab} 
              className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === tab ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium capitalize">{tab}</CardTitle>
                {getIcon(tab)}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats[tab]}</div>
                <p className="text-xs text-gray-500 mt-1">Total {tab}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="capitalize">{activeTab}</CardTitle>
                <CardDescription>Manage your {activeTab}</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add {activeTab.slice(0, -1)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? 'Update' : 'Create'} a new {activeTab.slice(0, -1)} here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {renderForm()}
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }} disabled={loading}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={editingItem ? handleUpdate : handleAdd} 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {editingItem ? 'Updating...' : 'Adding...'}
                            </>
                          ) : (
                            editingItem ? 'Update' : 'Add'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {filteredData[0] && Object.keys(filteredData[0]).map((key) => (
                        (key !== 'id' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') && (
                          <th key={key} className="text-left py-3 px-4 font-semibold text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        )
                      ))}
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item._id || item.id} className="border-b hover:bg-gray-50 transition-colors">
                        {Object.entries(item).map(([key, value]) => (
                          (key !== 'id' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') && (
                            <td key={key} className="py-3 px-4 text-sm text-gray-600">
                              {value}
                            </td>
                          )
                        ))}
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No {activeTab} found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;