import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Link } from "react-router-dom";

// Define Asset Type
interface AssetType {
  dateOfRegister: string;
  category: string;
  totalAmount: number;
}

// Define Data Types for Charts
interface LineChartData {
  name: string;
  count: number;
}

interface BarChartData {
  name: string;
  value: number;
}

// Define InfoBox Props
interface InfoBoxProps {
  color: string;
  title: string;
  value: string | number;
  icon: string;
}

// Define ChartCard Props
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const Dashboard = () => {
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total users
        const usersResponse = await axios.get<{ length: number }>("https://asset-backend-1976da1bf0ad.herokuapp.com/api/users");
        setTotalUsers(usersResponse.data.length);

        // Fetch all assets
        const assetsResponse = await axios.get<AssetType[]>("https://asset-backend-1976da1bf0ad.herokuapp.com/api/asset");
        const assets = assetsResponse.data;
        setTotalAssets(assets.length);

        console.log("Fetched Assets:", assets);

        // ✅ Calculate Total Amount
        const calculatedTotalAmount = assets.reduce((sum, asset) => sum + (asset.totalAmount || 0), 0);
        setTotalAmount(calculatedTotalAmount);

        // ✅ Group Assets by Category
        const categoryGroups: Record<string, number> = {};
        assets.forEach((asset) => {
          categoryGroups[asset.category] = (categoryGroups[asset.category] || 0) + 1;
        });
        setCategoryTotals(categoryGroups);
        console.log("Category Totals:", categoryGroups);

        // ✅ Group Assets by Date for Line Chart
        const groupedByDate: Record<string, number> = {};
        assets.forEach((asset) => {
          if (asset.dateOfRegister) {
            const date = asset.dateOfRegister.split("T")[0]; // Format: YYYY-MM-DD
            groupedByDate[date] = (groupedByDate[date] || 0) + 1;
          }
        });

        // ✅ Set State for Line Chart Data
        setLineChartData(
          Object.entries(groupedByDate).map(([date, count]) => ({
            name: date,
            count: count || 0, // Ensuring value is not undefined
          }))
        );

        // ✅ Prepare Bar Chart Data (Category-wise Count)
        setBarChartData(
          Object.entries(categoryGroups).map(([category, value]) => ({
            name: category,
            value: value || 0, // Ensuring value is not undefined
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Overall Summary Boxes */}
      <div className="row">
        <InfoBox color="info" title="Total Assets" value={totalAssets} icon="fas fa-shopping-cart" />
        <InfoBox color="success" title="Total Users" value={totalUsers} icon="fas fa-users" />
        <InfoBox color="primary" title="Total Amount" value={`TZS ${totalAmount.toLocaleString()}`} icon="fas fa-coins" />
      </div>

      {/* Category-Wise Summary */}
      <div className="row">
        <InfoBox color="primary" title="Computers & Accessories" value={categoryTotals["Computers & Accessories"] || 0} icon="fas fa-laptop" />
        <InfoBox color="success" title="Furniture & Equipments" value={categoryTotals["Furniture & Equipments"] || 0} icon="fas fa-chair" />
        <InfoBox color="warning" title="Intangible Assets" value={categoryTotals["Intangible Assets"] || 0} icon="fas fa-lightbulb" />
        <InfoBox color="danger" title="Land & Buildings" value={categoryTotals["Land & Buildings"] || 0} icon="fas fa-building" />
        <InfoBox color="info" title="Leasehold Improvement" value={categoryTotals["Leasehold Improvement"] || 0} icon="fas fa-tools" />
        <InfoBox color="dark" title="Motor Vehicles" value={categoryTotals["Motor Vehicles"] || 0} icon="fas fa-car" />
        <InfoBox color="secondary" title="Plan & Machinery" value={categoryTotals["Plan & Machinery"] || 0} icon="fas fa-industry" />
      </div>

      {/* Charts */}
      <div className="row">
        <ChartCard title="Assets Registered Over Time">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#4BC0C0" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Asset Categories Overview">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#36A2EB" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// ✅ InfoBox Component
const InfoBox: React.FC<InfoBoxProps> = ({ color, title, value, icon }) => (
  <div className="col-lg-4 col-md-6 col-12">
    <div className={`small-box bg-${color}`}>
      <div className="inner">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      <div className="icon">
        <i className={icon}></i>
      </div>
      <Link to="#" className="small-box-footer">
        More info <i className="fas fa-arrow-circle-right"></i>
      </Link>
    </div>
  </div>
);

// ✅ Chart Card Component
const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="col-lg-6 col-12">
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">{children}</div>
    </div>
  </div>
);

export default Dashboard;
