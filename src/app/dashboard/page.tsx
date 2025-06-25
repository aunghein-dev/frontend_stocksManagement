'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios';
import StoragePreview from "@/components/data-display/storagePreview";
import { FaDollarSign, FaChartLine, FaShoppingCart, FaBoxOpen } from 'react-icons/fa';
import MiniDataCard from "@/components/data-display/atoms/miniDataCard";
import { useInfo } from "@/hooks/useInfo";
import { useModalStore } from "@/store/modalStore";
import Link from 'next/link';

// --- Type Definitions ---
type PieChartData = {
  label: string;
  value: number;
};

type PieApiResponse = {
  product: string;
  data: number;
};

type BarsetMonthlyData = {
  month: string;
  [key: string]: number | string;
};

type BarsetSeriesItem = {
  dataKey: string;
  label: string;
};

// --- Dynamic Imports (keep ssr: false if charts don't support SSR) ---
const BarsDataset = dynamic(() => import('@/components/data-display/atoms/barset'), { ssr: false });
const PieChart = dynamic(() => import('@/components/data-display/atoms/pie'), { ssr: false });
const Radar = dynamic(() => import('@/components/data-display/atoms/radar'), { ssr: false });
const LineChart = dynamic(() => import('@/components/data-display/atoms/chart'), { ssr: false });

// --- Constants ---
const MAX_RADAR_ITEMS = 6;
const FETCH_MODAL_DELAY = 100; // Small delay to prevent modal flickering on very fast fetches

export default function Dashboard() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  // --- State for Dashboard Data ---
  const [dashboardData, setDashboardData] = useState<{
    barset: { series: BarsetSeriesItem[]; data: BarsetMonthlyData[] } | null;
    radar: any[] | null;
    minicard: any | null;
    storage: any | null;
    pie: PieChartData[] | null;
    line: number[] | null;
  }>({
    barset: null, radar: null, minicard: null, storage: null, pie: null, line: null,
  });

  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(false);
  const [dashboardDataError, setDashboardDataError] = useState<Error | null>(null);

  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const { openModal, closeModal } = useModalStore();

  // --- Memoized Data Transformations ---

  // Memoize radar data reshaping to prevent unnecessary re-calculations
  const reshapedRadar = useMemo(() => {
    const radarRawData = dashboardData.radar;
    if (!radarRawData || radarRawData.length === 0) {
      // FIX: Ensure unique labels for "NO ITEM" placeholders
      const uniqueMetrics = Array.from({ length: MAX_RADAR_ITEMS }).map((_, i) => `NO ITEM ${i + 1}`);
      return {
        metrics: uniqueMetrics,
        summer: Array(MAX_RADAR_ITEMS).fill(0),
        rainy: Array(MAX_RADAR_ITEMS).fill(0),
        winter: Array(MAX_RADAR_ITEMS).fill(0),
      };
    }

    const paddedRadarData = [...radarRawData];
    const initialLength = paddedRadarData.length; // Store initial length before padding
    const remaining = MAX_RADAR_ITEMS - initialLength;

    for (let i = 0; i < remaining; i++) {
      paddedRadarData.push({
        // FIX: Ensure unique labels for padded items
        metrics: `NO ITEM ${initialLength + i + 1}`,
        summerPoints: 0,
        rainyPoints: 0,
        winterPoints: 0,
      });
    }

    return {
      metrics: paddedRadarData.map(item => item.metrics),
      summer: paddedRadarData.map(item => item.summerPoints),
      rainy: paddedRadarData.map(item => item.rainyPoints),
      winter: paddedRadarData.map(item => item.winterPoints),
    };
  }, [dashboardData.radar]);

  // Memoize pie chart data for rendering
  const chartData = useMemo(() => {
    return dashboardData.pie?.map(item => ({
      label: item.label,
      value: item.value,
    })) || [];
  }, [dashboardData.pie]);


  // --- Centralized Data Fetching Logic ---
  const loadAllDashboardData = useCallback(async () => {
    if (!business?.businessId) {
      setIsLoadingDashboardData(false);
      return;
    }

    setIsLoadingDashboardData(true);
    setDashboardDataError(null);

    try {
      const [radarRes, minicardRes, storageRes, pieRes, lineRes, barsetRes] = await Promise.all([
        axios.get(`${API}/dashboard/radar/${business.businessId}`, { withCredentials: true }),
        axios.get(`${API}/dashboard/minicard/${business.businessId}`, { withCredentials: true }),
        axios.get(`${API}/dashboard/storage/${business.businessId}`, { withCredentials: true }),
        axios.get(`${API}/dashboard/pie/${business.businessId}`, { withCredentials: true }),
        axios.get(`${API}/dashboard/linechart/${business.businessId}`, { withCredentials: true }),
        axios.get(`${API}/dashboard/barset/${business.businessId}`, { withCredentials: true }),
      ]);

      const uniqueSeriesMap = new Map<string, BarsetSeriesItem>();
      barsetRes.data.forEach((item: any) => {
        const trimmedKey = item.groupName.trim();
        if (!uniqueSeriesMap.has(trimmedKey)) {
          uniqueSeriesMap.set(trimmedKey, { dataKey: trimmedKey, label: item.groupName.trim() });
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const initialTransformedBarsetData: BarsetMonthlyData[] = monthNames.map(month => {
        const monthData: BarsetMonthlyData = { month };
        Array.from(uniqueSeriesMap.keys()).forEach(groupName => {
          monthData[groupName] = 0;
        });
        return monthData;
      });

      barsetRes.data.forEach((group: any) => {
        const groupName = group.groupName.trim();
        group.value.forEach((val: number, monthIdx: number) => {
          if (monthIdx < initialTransformedBarsetData.length) {
            initialTransformedBarsetData[monthIdx][groupName] = val || 0;
          }
        });
      });

      const validSeries = Array.from(uniqueSeriesMap.values())
        .filter(series => initialTransformedBarsetData.some(month => series.dataKey in month));

      const formattedPie: PieChartData[] = pieRes.data.map((item: PieApiResponse) => ({
        label: item.product, value: item.data,
      }));

      const formattedLine: number[] = lineRes.data.map((item: { data: number }) => item.data);

      setDashboardData({
        barset: { series: validSeries, data: initialTransformedBarsetData },
        radar: radarRes.data,
        minicard: minicardRes.data,
        storage: storageRes.data,
        pie: formattedPie,
        line: formattedLine,
      });

    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setDashboardDataError(new Error(`Failed to load dashboard data: ${err.message || 'Please check your connection.'}`));
      setDashboardData({ barset: null, radar: null, minicard: null, storage: null, pie: null, line: null });
    } finally {
      setIsLoadingDashboardData(false);
    }
  }, [API, business?.businessId]);

  // --- Unified Modal Control and Data Fetching Orchestration ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const showModal = isBusinessInfoLoading || isLoadingDashboardData;

    if (showModal) {
      // No message here, as the modal should display generic loading UI.
      // Specific messages are handled by the conditional renders below for errors/no business.
      openModal("loading");
    } else {
      timer = setTimeout(() => {
        closeModal();
      }, FETCH_MODAL_DELAY);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isBusinessInfoLoading, isLoadingDashboardData, openModal, closeModal]);

  // Effect to trigger dashboard data fetch when business info is ready
  useEffect(() => {
    if (!isBusinessInfoLoading && !businessInfoError) {
      if (business?.businessId) {
        const isDashboardDataLoaded = dashboardData.barset !== null &&
                                     dashboardData.radar !== null &&
                                     dashboardData.minicard !== null &&
                                     dashboardData.storage !== null &&
                                     dashboardData.pie !== null &&
                                     dashboardData.line !== null;

        if (!isDashboardDataLoaded) {
          loadAllDashboardData();
        }
      } else {
        setIsLoadingDashboardData(false);
        // Open modal without specific message here, as it's handled by the conditional render below.
        openModal("loading"); // This will just trigger the default loading modal state
      }
    }
  }, [
    business,
    isBusinessInfoLoading,
    businessInfoError,
    loadAllDashboardData,
    dashboardData,
    openModal
  ]);


  // --- Conditional Render Guards (for critical early exits and messages) ---

  if (businessInfoError) {
    return (
      <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
        <p className="text-red-600 text-lg font-medium text-center p-6 rounded-lg bg-red-50 shadow-xs">
          Error loading business information: {businessInfoError.message || "An unknown error occurred."}
          <button onClick={useInfo().refresh} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
            Retry
          </button>
        </p>
      </div>
    );
  }

  if (!business?.businessId && !isBusinessInfoLoading) {
    return (
      <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
        <p className="text-gray-600 text-lg font-medium text-center p-6 rounded-lg bg-gray-50 shadow-xs">
          No business selected or available for dashboard.
          <br />Please select a business from the navigation or add a new one.
        </p>
      </div>
    );
  }

  if (dashboardDataError) {
    return (
      <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
        <p className="text-red-600 text-lg font-medium text-center p-6 rounded-lg bg-red-50 shadow-xs">
          {dashboardDataError.message}
          <button onClick={loadAllDashboardData} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
            Retry Loading Dashboard
          </button>
        </p>
      </div>
    );
  }


  

  // --- Main Dashboard Content (renders only if data is available) ---
  return (
    <section className="h-full overflow-hidden">
      <div className="bg-white rounded-sm p-2 md:p-1 shadow-xs">
        <div
          className="overflow-y-auto overflow-x-hidden custom-scrollbar pt-2 px-1"
          style={{ height: "calc(100dvh - 117.5px)" }}
        >
          {/* Mini cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 justify-between pb-4 md:pb-6 border-b border-gray-200 pl-3 pr-2">
            {dashboardData.minicard ? (
              <>
                <MiniDataCard title="Revenue" value={`${dashboardData.minicard.revenue?.toLocaleString() ?? '0'}`} icon={<FaDollarSign />} />
                <MiniDataCard title="Growth" value={`${dashboardData.minicard.growth ?? 0}%`} icon={<FaChartLine />} />
                <MiniDataCard title="Orders" value={dashboardData.minicard.orders ?? 0} icon={<FaShoppingCart />} />
                <MiniDataCard title="Products" value={dashboardData.minicard.products ?? 0} icon={<FaBoxOpen />} />
              </>
            ) : (
                <p className="col-span-full text-center text-gray-500 py-4">No mini card data available.</p>
            )}
          </div>

          {/* Bars and Radar charts */}
          <div className="grid grid-cols-1 md:[grid-template-columns:60%_40%] gap-2 pt-4 md:pt-6 pb-4 md:pb-6 border-b border-gray-200 w-full md:pr-4 px-3">
            <div className="flex items-center min-h-[250px] md:min-h-[300px] justify-center bg-gray-50 rounded-lg p-2 pt-10 border-[0.5px] border-gray-100 shadow-xs">
              {dashboardData.barset?.data.length && dashboardData.barset?.series.length ? (
                  <BarsDataset
                  series={dashboardData.barset.series}
                  dataset={dashboardData.barset.data}
                />
              ) : (
                <p className="text-sm text-gray-400">No bar chart data available.</p>
              )}
            </div>
            <div className="flex items-center justify-center min-h-[250px] md:min-h-[300px]
                            p-2 rounded-lg bg-gray-50 pt-10 border-[0.5px] border-gray-100 shadow-xs">
              {dashboardData.radar===null ? (
                <Radar
                  metrics={reshapedRadar.metrics}
                  summerData={reshapedRadar.summer}
                  rainningData={reshapedRadar.rainy}
                  winterData={reshapedRadar.winter}
                />
              ) : (
                <p className="text-sm text-gray-400">No radar chart data available.</p>
              )}
            </div>
          </div>

          {/* Storage, Pie chart, Line chart */}
          <div className="grid grid-cols-1 lg:[grid-template-columns:60%_40%] gap-2 px-3 lg:pr-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="min-h-[200px] flex justify-center items-center bg-gray-50 
                              rounded-lg border-[0.5px] border-gray-100 shadow-xs">
                {dashboardData.storage ? (
                  <StoragePreview
                    number={Math.ceil(dashboardData.storage.usagePercentage ?? 0)}
                    storage={parseFloat((((dashboardData.storage.usagePercentage ?? 0) / 100) * 1024).toFixed(2))}
                  />
                ) : (
                  <p className="text-sm text-gray-400">No storage data available.</p>
                )}
              </div>
              <div className="flex items-center justify-center min-h-[250px] bg-gray-50 
                              rounded-lg border-[0.5px] border-gray-100 shadow-xs">
                {chartData.length > 0 ? (
                  <PieChart data={chartData} />
                ) : (
                  <p className="text-sm text-gray-400">No pie chart data available.</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center min-h-[300px] 
                            px-3.5 bg-gray-50 rounded-lg
                            border-[0.5px] border-gray-100 shadow-xs">

            {/* Add a null check for dashboardData.line */}
            {dashboardData.line && dashboardData.line.reduce((a, b) => a + b, 0) > 0 ? (
              <LineChart
                series={[
                  {
                    data: dashboardData.line,
                    label: 'Sales',
                    color: '#876FD4',
                    area: false,
                  }
                ]}
              />
            ) : (
              <p className="text-sm text-gray-400">No line chart data available.</p>
            )}
          </div>
            </div>
          </div>
        </div>

    </section>
  );
}