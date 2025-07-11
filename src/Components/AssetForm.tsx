import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const depreciationRates = {
  'Computers & Accessories': 33,
  'Furniture & Equipments': 20,
  'Intangible Assets': 10,
  'Land & Buildings': 5,
  'Leasehold Improvement': 20,
  'Motor Vehicles': 20,
  'Plan & Machinery': 25,
};

const usefulLifeMonths = {
  'Computers & Accessories': 36,
  'Furniture & Equipments': 60,
  'Intangible Assets': 120,
  'Land & Buildings': 240,
  'Leasehold Improvement': 60,
  'Motor Vehicles': 60,
  'Plan & Machinery': 48,
};

const AssetForm: React.FC = () => {
  const [formData, setFormData] = useState({
    tagNumber: '',
    dateOfRegister: new Date().toISOString().split('T')[0],
    itemDescription: '',
    department: '',
    departmentManager: '',
    user: '',
    physicalLocation: '',
    assetCondition: '',
    quantity: '',
    category: '',
    costPerItem: '',
    totalAmount: '',
    depreciationRate: '',
    usefulLifeMonths: '',
    numberOfRemainingMonths: '',
    numberOfMonthsInUse: '',
    monthlyDepreciation: '',
    accumulatedDepreciation: '',
    invoiceNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ _id: any; id: string; firstname: string }[]>([]);
  const [managers, setManagers] = useState<{ _id: any; id: string; firstname: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('https://asset-backend-1976da1bf0ad.herokuapp.com/api/users');
        const managerResponse = await axios.get('https://asset-backend-1976da1bf0ad.herokuapp.com/api/users');

        setUsers(userResponse.data);
        setManagers(managerResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch users and managers.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'category') {
      const rate = depreciationRates[value as keyof typeof depreciationRates] || 0;
      const lifeMonths = usefulLifeMonths[value as keyof typeof usefulLifeMonths] || 0;

      updatedData = {
        ...updatedData,
        depreciationRate: rate.toString(),
        usefulLifeMonths: lifeMonths.toString(),
        numberOfRemainingMonths: lifeMonths.toString(),
      };
    }

    if (name === 'costPerItem' || name === 'quantity') {
      const cost = parseFloat(updatedData.costPerItem) || 0;
      const quantity = parseInt(updatedData.quantity) || 0;
      updatedData.totalAmount = (cost * quantity).toString();
    }

    const cost = parseFloat(updatedData.costPerItem) || 0;
    const quantity = parseInt(updatedData.quantity) || 0;
    const usefulLife = parseInt(updatedData.usefulLifeMonths) || 0;
    const depreciationRate = parseFloat(updatedData.depreciationRate) || 0;

    if (cost && quantity && usefulLife && depreciationRate > 0) {
      const monthlyDepreciation = (cost * quantity) / usefulLife;
      updatedData.monthlyDepreciation = monthlyDepreciation.toFixed(2);

      const currentDate = new Date();
      const registerDate = new Date(updatedData.dateOfRegister);
      const monthsInUse = Math.floor((currentDate.getTime() - registerDate.getTime()) / (1000 * 3600 * 24 * 30));
      updatedData.numberOfMonthsInUse = monthsInUse.toString();

      const accumulatedDepreciation = monthlyDepreciation * monthsInUse * (depreciationRate / 100);
      updatedData.accumulatedDepreciation = accumulatedDepreciation.toFixed(2);

      updatedData.numberOfRemainingMonths = (usefulLife - monthsInUse).toString();
    }

    setFormData(updatedData);
  };

  const handleSelectChange = (selectedOption: any, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Error: No authentication token found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("https://asset-backend-1976da1bf0ad.herokuapp.com/api/asset", formData, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Asset saved successfully!");
        setFormData({
          tagNumber: "",
          dateOfRegister: new Date().toISOString().split("T")[0],
          itemDescription: "",
          department: "",
          departmentManager: "",
          user: "",
          physicalLocation: "",
          assetCondition: "",
          quantity: "",
          category: "",
          costPerItem: "",
          totalAmount: "",
          depreciationRate: "",
          usefulLifeMonths: "",
          numberOfRemainingMonths: "",
          numberOfMonthsInUse: "",
          monthlyDepreciation: "",
          accumulatedDepreciation: "",
          invoiceNumber: "",
        });
      } else {
        toast.error("Failed to save asset");
      }
    } catch (error: any) {
      console.error("Error saving asset:", error.response?.data || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <br />
      <div className="card card-primary">
        <div className="card-header" style={{ background: "linear-gradient(90deg, #007bff, #0056b3)" }}>
          <h3 className="card-title">Asset Data Entry Form</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="row">
              {/* User Dropdown */}
              <div className="col-md-6">
                <div className="form-group">
                  <label>User</label>
                  <Select
                    options={users.map(user => ({ value: user._id, label: user.firstname }))}
                    isSearchable
                    onChange={(selectedOption) => handleSelectChange(selectedOption, "user")}
                    placeholder="Search and Select User"
                  />
                </div>
              </div>

              {/* Department Manager Dropdown */}
              <div className="col-md-6">
                <div className="form-group">
                  <label>Department Manager</label>
                  <Select
                    options={managers.map(manager => ({ value: manager._id, label: manager.firstname }))}
                    isSearchable
                    onChange={(selectedOption) => handleSelectChange(selectedOption, "departmentManager")}
                    placeholder="Search and Select Manager"
                  />
                </div>
              </div>

              {/* Invoice Number Field (Manually Rendered) */}
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="invoiceNumber" className="text-secondary">Voucher No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="invoiceNumber"
                    name="invoiceNumber"
                    placeholder="Enter Invoice Number"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Loop through remaining fields */}
              {Object.keys(formData).map((key) =>
                key === 'category' ? (
                  <div className="col-md-6" key={key}>
                    <div className="form-group">
                      <label htmlFor={key}>Category</label>
                      <select
                        className="form-control"
                        id={key}
                        name={key}
                        value={formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {Object.keys(depreciationRates).map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : key === 'itemDescription' ? (
                  <div className="col-md-6" key={key}>
                    <div className="form-group">
                      <label htmlFor={key} className='text-secondary'>Item Description</label>
                      <textarea
                        className="form-control"
                        id={key}
                        name={key}
                        placeholder="Enter item description"
                        value={formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                ) : key === 'user' || key === 'departmentManager' || key === 'invoiceNumber' ? null : (
                  <div className="col-md-6" key={key}>
                    <div className="form-group">
                      <label className="text-secondary" htmlFor={key}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type={key === 'dateOfRegister' ? 'date' : 'text'}
                        className="form-control"
                        id={key}
                        name={key}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                        value={formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AssetForm;
