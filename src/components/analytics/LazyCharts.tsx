"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Chart, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale, LinearScale,
    PointElement, LineElement,
    BarElement, BarController, LineController,
    ArcElement,
    Title, Tooltip, Legend
);

export function MixedChart(props: any) {
    return <Chart {...props} />;
}

export function DoughnutChart(props: any) {
    return <Doughnut {...props} />;
}

export function LineChart(props: any) {
    return <Line {...props} />;
}
