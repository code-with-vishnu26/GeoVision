/**
 * GSIS API v4.0 — Full production API client
 */

export const API_BASE = "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PredictionResult {
    predicted_class: string;
    confidence: number;
    ndvi_mean: number;
    ndvi_min?: number;
    ndvi_max?: number;
    ndvi_std?: number;
    ndwi_mean?: number;
    flood_risk?: string;
    vegetation_status?: string;
    vegetation_stress?: { level: string; description: string };
    analysis_model: string;
    probabilities: { name: string; value: number }[];
    dominant_rgb?: { red: number; green: number; blue: number };
    brightness?: number;
    texture?: number;
    band_count?: number;
    // CNN deep learning
    cnn_class?: string;
    cnn_confidence?: number;
    cnn_probabilities?: { name: string; value: number }[];
    cnn_device?: string;
    // Heat anomaly
    temperature_avg?: number;
    heat_risk?: string;
    processing_metadata: {
        file_size_bytes: number;
        file_size_kb: number;
        processing_time_seconds: number;
        image_dimensions: string;
        file_type: string;
        model_version: string;
        analysis_engines?: string[];
    };
}

export interface BatchResult {
    results: (PredictionResult & { filename?: string; error?: string })[];
    total: number;
    successful: number;
}

export interface SystemHealth {
    status: string;
    uptime_seconds: number;
    uptime_human: string;
    model_version: string;
    rasterio_available: boolean;
    python_version: string;
    timestamp: string;
    cpu_percent?: number;
    memory_percent?: number;
    disk_percent?: number;
}

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    uploads: number;
}

export interface MonitoredRegion {
    name: string;
    average_ndvi: number | null;
    average_ndwi: number | null;
    risk_level: string;
    last_processed: string | null;
    latitude: number;
    longitude: number;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export async function predictImage(file: File): Promise<PredictionResult> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/predict`, { method: "POST", body: fd });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Prediction failed" }));
        throw new Error(err.detail || "Prediction failed");
    }
    return res.json();
}

export async function batchPredict(files: File[]): Promise<BatchResult> {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const res = await fetch(`${API_BASE}/batch-predict`, { method: "POST", body: fd });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Batch prediction failed" }));
        throw new Error(err.detail || "Batch prediction failed");
    }
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export async function fetchHistory() {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
}

export async function fetchAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return res.json();
}

export async function resolveAlertAPI(alertId: number) {
    const res = await fetch(`${API_BASE}/resolve-alert/${alertId}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to resolve alert");
    return res.json();
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/system-health`);
    if (!res.ok) throw new Error("Backend unreachable");
    return res.json();
}

export async function fetchAdminUsers(): Promise<{ users: AdminUser[] }> {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function fetchDashboardRegions(): Promise<{ regions: MonitoredRegion[]; total: number }> {
    const res = await fetch(`${API_BASE}/dashboard/regions`);
    if (!res.ok) throw new Error("Failed to fetch regions");
    return res.json();
}

export async function fetchRegions(): Promise<{ regions: MonitoredRegion[]; total: number }> {
    const res = await fetch(`${API_BASE}/regions`);
    if (!res.ok) throw new Error("Failed to fetch regions");
    return res.json();
}

export async function triggerMonitoringCycle() {
    const res = await fetch(`${API_BASE}/regions/trigger-cycle`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to trigger monitoring");
    return res.json();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getConfidenceMessage(confidence: number) {
    if (confidence >= 0.85) return { message: "High confidence classification. Strong pattern match.", level: "high" as const };
    if (confidence >= 0.50) return { message: "Moderate confidence. Image may contain mixed features.", level: "moderate" as const };
    return { message: "Low confidence. Consider using higher-resolution imagery.", level: "low" as const };
}

export function getNdviColor(ndvi: number): string {
    if (ndvi > 0.6) return "#16a34a";
    if (ndvi > 0.4) return "#22c55e";
    if (ndvi > 0.2) return "#84cc16";
    if (ndvi > 0.05) return "#eab308";
    if (ndvi > -0.05) return "#a16207";
    return "#3b82f6";
}

export function getNdviLabel(ndvi: number): string {
    if (ndvi > 0.6) return "Dense Vegetation";
    if (ndvi > 0.4) return "Healthy Vegetation";
    if (ndvi > 0.2) return "Moderate Vegetation";
    if (ndvi > 0.05) return "Sparse / Bare";
    if (ndvi > -0.05) return "Barren";
    return "Water";
}

export function getFloodColor(risk: string): string {
    if (risk === "Critical") return "#ef4444";
    if (risk === "High") return "#f97316";
    if (risk === "Moderate") return "#eab308";
    if (risk === "Low") return "#22c55e";
    return "#6b7280";
}

export function getRiskColor(risk: string): string {
    if (risk === "Critical") return "#ef4444";
    if (risk === "High") return "#f97316";
    if (risk === "Moderate") return "#eab308";
    if (risk === "Low") return "#22c55e";
    return "#6b7280";
}
