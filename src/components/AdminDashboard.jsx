import React, { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Search, Calendar, Users, UserCog, Menu,
  X, Loader2, LogOut, Home, ArrowLeft, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import Logoimg from "../components/Logoimg.png";

const AdminDashboard = () => {
  const API_BASE_URL = "http://localhost:8080/api";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataMap, setDataMap] = useState({
    doctors: [],
    appointments: [],
    users: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formMode, setFormMode] = useState("add");
  const [fields, setFields] = useState([]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "doctors", label: "Doctors", icon: UserCog },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
  ];

  useEffect(() => {
    if (currentPage !== "dashboard") fetchData(currentPage);
  }, [currentPage]);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchData = async (type) => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = `${API_BASE_URL}/${type}`;
      if (type === "users") {
        const Id = localStorage.getItem("Id") || 2;
        url = `${API_BASE_URL}/users/${Id}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      const items = Array.isArray(data.data || data) ? (data.data || data) : [data.data || data];

      setDataMap((prev) => ({ ...prev, [type]: items }));

      if (Array.isArray(items) && items.length > 0) {
        const sample = items[0];
        const autoFields = Object.keys(sample)
          .filter((key) => key !== "id" && key !== "createdAt" && key !== "updatedAt")
          .map((key) => ({ name: key, type: detectFieldType(key, sample[key]) }));
        setFields(autoFields);
      }
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setDataLoading(false);
    }
  };

  const detectFieldType = (key, value) => {
    if (key.toLowerCase().includes("email")) return "email";
    if (key.toLowerCase().includes("date")) return "date";
    if (typeof value === "number") return "number";
    return "text";
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = formMode === "add" ? "POST" : "PUT";
      const url =
        formMode === "add"
          ? `${API_BASE_URL}/${currentPage}`
          : `${API_BASE_URL}/${currentPage}/${formData.id}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      showAlert(`${currentPage.slice(0, -1)} ${formMode === "add" ? "added" : "updated"} successfully`);
      fetchData(currentPage);
      setShowForm(false);
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${currentPage}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showAlert(`${currentPage.slice(0, -1)} deleted successfully`);
      fetchData(currentPage);
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    currentPage !== "dashboard"
      ? dataMap[currentPage].filter((item) =>
          Object.values(item).some((val) =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      : [];

  const renderTable = () => {
    const currentData = filteredData;
    if (dataLoading)
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
        </div>
      );

    if (!currentData.length)
      return <p className="text-gray-400 mt-6">No records found.</p>;

    return (
      <div className="overflow-x-auto mt-8 rounded-2xl shadow-xl border border-white/10 bg-white/5 backdrop-blur-md">
        <table className="min-w-full border-collapse text-sm md:text-base text-gray-300">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
              {Object.keys(currentData[0]).map((key) => (
                <th key={key} className="text-left px-6 py-4 font-semibold uppercase tracking-wide border-b border-blue-500/40">
                  {key}
                </th>
              ))}
              <th className="px-6 py-4 text-right font-semibold uppercase tracking-wide border-b border-blue-500/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr
                key={item.id || index}
                className={`transition-all duration-200 ${
                  index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                } hover:bg-blue-900/40`}
              >
                {Object.keys(item).map((key) => (
                  <td key={key} className="px-6 py-3 border-b border-white/10 truncate max-w-[250px]">
                    {item[key]}
                  </td>
                ))}
                <td className="px-6 py-3 text-right border-b border-white/10">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-blue-800/50 rounded-full p-2"
                      onClick={() => {
                        setFormMode("edit");
                        setFormData(item);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-red-800/50 rounded-full p-2"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden text-gray-200">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0f172a] text-white shadow-2xl overflow-hidden"
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 px-6 py-5 border-b border-blue-700 bg-blue-900/30">
              <img src={Logoimg} alt="Logo" className="w-8 h-8 rounded-lg" />
              <h2 className="text-xl font-bold tracking-wide">Doctris Admin</h2>
            </div>
            <nav className="mt-6 space-y-2 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03, x: 5 }}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-blue-100 hover:bg-blue-800/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-blue-700/50">
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              variant="outline"
              className="w-full bg-blue-800/40 hover:bg-red-600 text-white border-none"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-[#1e293b]/80 backdrop-blur-md px-6 py-4 border-b border-white/10 shadow-lg">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <h1 className="text-lg font-semibold tracking-wide text-white">
            {currentPage === "dashboard"
              ? "Admin Dashboard"
              : `Manage ${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`}
          </h1>
        </header>

        {/* Alerts */}
        {alert && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute right-6 top-6 z-50"
          >
            <Alert
              className={`shadow-xl border-l-4 ${
                alert.type === "success"
                  ? "bg-green-900/50 border-green-400 text-green-100"
                  : "bg-red-900/50 border-red-400 text-red-100"
              }`}
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentPage === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Welcome, Admin 👋
                </h2>
                <p className="text-gray-400">Manage doctors, appointments, and users efficiently.</p>

                <div className="grid md:grid-cols-3 gap-6">
                  {menuItems.slice(1).map((item) => {
                    const Icon = item.icon;
                    const count = dataMap[item.id]?.length || 0;
                    return (
                      <Card
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className="cursor-pointer bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all border border-white/10 shadow-lg"
                      >
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle className="text-sm font-semibold text-gray-200">
                            {item.label}
                          </CardTitle>
                          <Icon className="text-blue-400" />
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-white">{count}</p>
                          <p className="text-sm text-gray-400 mt-1">Total {item.label}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <Input
                    placeholder={`Search ${currentPage}...`}
                    className="max-w-xs bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    onClick={() => {
                      setFormMode("add");
                      setFormData({});
                      setShowForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add {currentPage.slice(0, -1)}
                  </Button>
                </div>
                {renderTable()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modal Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col z-50 overflow-auto"
        >
          <div className="flex items-center justify-between p-6 bg-[#1e293b] border-b border-white/10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-blue-300 hover:text-blue-100"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
              <h2 className="text-2xl font-bold text-blue-300 capitalize">
                {formMode === "add"
                  ? `Add ${currentPage.slice(0, -1)}`
                  : `Edit ${currentPage.slice(0, -1)}`}
              </h2>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl w-[90%] mx-auto bg-[#0f172a] shadow-2xl rounded-3xl p-12 mt-12 mb-24 border border-white/10"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col space-y-2">
                  <Label className="text-gray-300 font-medium text-base">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </Label>
                  <Input
                    type={field.type}
                    name={field.name}
                    placeholder={`Enter ${field.name}`}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    required
                    className="border-white/20 bg-white/5 text-white h-12 text-base focus:ring-2 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="px-6 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
