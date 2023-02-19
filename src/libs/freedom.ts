import axios, { AxiosInstance } from "axios";

export interface IDevice {
  id: number;
  name: string;
  os: string;
  user_id: string;
  hash: string;
  blocked_apps: unknown[];
  last_seen: string;
}

export interface IDeviceList {
  devices: IDevice[];
}

export interface ISchedule {
  device_ids: string[];
  filter_list_ids: string[];
}

export interface IScheduleList {
  schedules: ISchedule[];
}

export interface CuratedFilter {
  id: number;
  name: string;
  uris: string[];
}

export interface IFilter {
  id: number;
  name: string;
  curated_filters: CuratedFilter[];
}

export interface IFilterList {
  filter_lists: IFilter[];
}

export interface IProfile {
  id: string;
  email: string;
}

export interface ICreateScheduleData {
  filter_list_ids: number[];
  device_ids: number[];
  duration: number;
  start_time: string;
  block_everything: boolean;
  block_apps: boolean;
}

export interface IFreedom {
  listDevices(): Promise<IDeviceList>;
  listSchedules(): Promise<IScheduleList>;
  listFilters(): Promise<IFilterList>;
  //   getProfile(): Promise<IProfile>;
  createShedule(data: ICreateScheduleData): Promise<void>;
}

export class Freedom implements IFreedom {
  private readonly axios: AxiosInstance;
  constructor(cookie: string, xCsrfToken: string) {
    this.axios = axios.create({
      baseURL: "https://freedom.to",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        Cookie: cookie,
        "X-CSRF-Token": xCsrfToken,
      },
    });
  }

  async listSchedules() {
    const { data } = await this.axios.get<IScheduleList>("/schedules");
    return data;
  }

  async listFilters() {
    const { data } = await this.axios.get<IFilterList>("/filter_lists");
    return data;
  }

  async listDevices() {
    const { data } = await this.axios.get<IDeviceList>("/devices");
    return data;
  }

  async createShedule(data: ICreateScheduleData): Promise<void> {
    const response = await this.axios.post("/schedules", data);
    if (response.status !== 201) {
      throw new Error(`Failed to create schedule: ${response.status} ${response.statusText}`);
    }
  }
}
