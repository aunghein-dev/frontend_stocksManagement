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
import { useTranslation } from "@/hooks/useTranslation";
import PageLost404 from '@/components/error/pageLost404';

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

interface BarsetData {
  groupName: string;
  value: (string | number)[];
}


type RadarDataType = {
  metrics: string,
  summerPoints: number,
  rainyPoints: number,
  winterPoints: number,
}

type MiniCardDataType = {
  revenue: number;
  growth: number;
  orders: string;
  products: string;
}

type Storage = {
  usagePercentage: number | null;
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
    radar: RadarDataType[] | null;
    minicard: MiniCardDataType | null;
    storage: Storage | null;
    pie: PieChartData[] | null;
    line: number[] | null;
  }>({
    barset: null, radar: null, minicard: null, storage: null, pie: null, line: null,
  });

  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(false);
  const [dashboardDataError, setDashboardDataError] = useState<Error | null>(null);

  const { business, isLoading: isBusinessInfoLoading, error: businessInfoError } = useInfo();
  const { openModal, closeModal } = useModalStore();
  const { t } = useTranslation();
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
      barsetRes.data.forEach((item: BarsetData) => {
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

      barsetRes.data.forEach((group: BarsetData) => {
        const groupName = group.groupName.trim();
        group.value.forEach((val: string | number, monthIdx: number) => {
          // Convert val to number safely
          const numericVal = typeof val === "string" ? parseFloat(val) : val;

          if (monthIdx < initialTransformedBarsetData.length) {
            initialTransformedBarsetData[monthIdx][groupName] = numericVal || 0;
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

    } catch (err: unknown) {
      console.error("Error loading dashboard data:", err);

      const message = isErrorWithMessage(err) ? err.message : "Please check  connection.";

      setDashboardDataError(new Error(`Failed to load dashboard data: ${message}`));
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

  function isErrorWithMessage(err: unknown): err is { message: string } {
    return typeof err === "object" && err !== null && "message" in err && typeof (err as Record<string, unknown>).message === "string";
  }


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
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
       <PageLost404 
        header={t("msg_wrong")}
        message={businessInfoError?.message || "Please check  connection."}
        reload={() => window.location.reload()}
        />
    </div>
    );
  }

  if(!business?.businessId && !isBusinessInfoLoading) {
    return (
      <div className='flex justify-center items-center p-4'>
        <p className="text-red-600 text-sm font-medium text-center p-6 rounded-xs bg-gray-50 shadow-xs">
          No business selected or available for dashboard.
          <br />Please select a business from the navigation or add a new one.
        </p>
      </div>
    );
  }

  if (dashboardDataError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
       <PageLost404 
        header={t("msg_wrong")}
        message={dashboardDataError.message || "Dashboard data not available."}
        reload={() => window.location.reload()}
        />
    </div>
    );
  }



  // --- Main Dashboard Content (renders only if data is available) ---
  return (
    <section className="h-full overflow-hidden">
      <div className="bg-white rounded-xs py-2 shadow-xs">
        <div
          className="overflow-y-auto overflow-x-hidden custom-scrollbar px-2"
          style={{ height: "calc(100dvh - 128px)" }}
        >
          {/* Mini cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 justify-between pb-4 md:pb-6 border-b border-gray-200">
            {dashboardData.minicard ? (
              <>
                <MiniDataCard title={t("dash_revenue")} value={`${dashboardData.minicard.revenue?.toLocaleString() ?? '0'}`} icon={<FaDollarSign />} />
                <MiniDataCard title={t("dash_growth")} value={`${dashboardData.minicard.growth ?? 0}%`} icon={<FaChartLine />} />
                <MiniDataCard title={t("dash_orders")} value={dashboardData.minicard.orders ?? 0} icon={<FaShoppingCart />} />
                <MiniDataCard title={t("dash_products")} value={dashboardData.minicard.products ?? 0} icon={<FaBoxOpen />} />
              </>
            ) : (
                <p className="col-span-full text-center text-gray-500 py-4">No mini card data available.</p>
            )}
          </div>

          {/* Bars and Radar charts */}
          <div className="grid grid-cols-1 md:[grid-template-columns:60%_40%] gap-2 pt-4 md:pt-6 pb-4 md:pb-6 border-b border-gray-200 w-full pr-2">
            <div className="flex items-center min-h-[250px] md:min-h-[300px] justify-center bg-gray-50 rounded-xs p-2 pt-10 border-[0.5px] border-gray-100 shadow-xs relative">
              {dashboardData.barset?.data.length && dashboardData.barset?.series.length ? (
                  <div className='w-full'>
                     <BarsDataset
                      series={dashboardData.barset.series}
                      dataset={dashboardData.barset.data}
                      />
                     <Link href='/'
                           className='text-blue-600 absolute right-2.5 top-2
                                      text-xs cursor-pointer hover:underline decoration-2
                                      transition-all duration-200'>{t("btnTxt_viewReport")}</Link>
                  </div>
                 
              ) : (
                <p className="text-sm text-gray-400">No bar chart data available.</p>
              )}
            </div>
            <div className="flex items-center justify-center min-h-[250px] md:min-h-[300px]
                            p-2 rounded-xs bg-gray-50 pt-10 border-[0.5px] border-gray-100 shadow-xs relative">
              {dashboardData.radar!==null ? (
                <div className='w-full'>
                     <Radar
                      metrics={reshapedRadar.metrics}
                      summerData={reshapedRadar.summer}
                      rainningData={reshapedRadar.rainy}
                      winterData={reshapedRadar.winter}
                    />
                    <Link href='/'
                          className='text-blue-600 absolute right-2.5 top-2
                                    text-xs cursor-pointer hover:underline decoration-2
                                    transition-all duration-200'>{t("btnTxt_viewReport")}</Link>
                </div>
               
              ) : (
                <p className="text-sm text-gray-400">No radar chart data available.</p>
              )}
            </div>
          </div>

          {/* Storage, Pie chart, Line chart */}
          <div className="grid grid-cols-1 lg:[grid-template-columns:60%_40%] gap-2 px-3 lg:pr-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="min-h-[200px] flex justify-center items-center bg-gray-50 
                              rounded-xs border-[0.5px] border-gray-100 shadow-xs relative">
                {dashboardData.storage ? (
                  <div className='w-full'>
                    <StoragePreview
                      number={Math.ceil(dashboardData.storage.usagePercentage ?? 0)}
                      storage={parseFloat((((dashboardData.storage.usagePercentage ?? 0) / 100) * 1024).toFixed(2))}
                    />
                  
                    <Link href='/'
                        className='text-green-500 absolute right-2.5 top-2
                                  text-xs cursor-pointer hover:underline decoration-2
                                  transition-all duration-200'>{t("btnTxt_upgradePro")}</Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No storage data available.</p>
                )}
              </div>
              <div className="flex items-center justify-center min-h-[250px] bg-gray-50 
                              rounded-xs border-[0.5px] border-gray-100 shadow-xs relative">
                {chartData.length > 0 ? (
                  <div className='w-full'>
                    <PieChart data={chartData} />
                    <Link href='/'
                          className='text-blue-600 absolute right-2.5 top-2
                                    text-xs cursor-pointer hover:underline decoration-2
                                    transition-all duration-200'>{t("btnTxt_viewReport")}</Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No pie chart data available.</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center min-h-[300px] 
                            rounded-xs w-full bg-gray-50
                            border-[0.5px] border-gray-100 shadow-xs relative">

            {/* Add a null check for dashboardData.line */}
            {dashboardData.line && dashboardData.line.reduce((a, b) => a + b, 0) > 0 ? (
              <div className='w-full'>
                <LineChart
                  series={[
                    {
                      data: dashboardData.line,
                      label: t('lbl_sales'),
                      color: '#876FD4',
                      area: false,
                    }
                  ]}
                />
                <Link href='/'
                            className='text-blue-600 absolute right-2.5 top-2
                                      text-xs cursor-pointer hover:underline decoration-2
                                      transition-all duration-200'>{t("btnTxt_viewReport")}</Link>
              </div>
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