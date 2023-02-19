import { Action, ActionPanel, Detail, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { Freedom, ICreateScheduleData, IDeviceList, IFilterList } from "./libs/freedom";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "react-query";
import { getPreferences } from "./libs/preferences";
import Style = Toast.Style;

interface IFilterProps {
  filters: IFilterList | undefined;
  error: string | undefined;
  setError: (error: string | undefined) => void;
}

interface IDevicesProps {
  devices: IDeviceList | undefined;
}

interface IForm {
  duration: string;
  filterIds: string[];
  deviceIds: string[];
}

function Duration() {
  return <Form.TextField id="duration" defaultValue="15" title="Duration in minutes" />;
}

function Filters(props: IFilterProps) {
  return (
    <Form.TagPicker
      id="filterIds"
      autoFocus={true}
      title="Blocklists"
      error={props.error}
      onChange={(newValue) => {
        console.log("event");
        if (newValue.length > 0) {
          props.setError(undefined);
        } else {
          props.setError("The field shouldn't be empty!");
        }
      }}
      onBlur={(event) => {
        console.log("event");
        const newValue = event.target.value as string[];
        if (newValue.length > 0) {
          props.setError(undefined);
        } else {
          props.setError("The field shouldn't be empty!");
        }
      }}
    >
      {props?.filters?.filter_lists.map((filter) => (
        <Form.TagPicker.Item key={filter.id.toString()} value={filter.id.toString()} title={filter.name} />
      ))}
    </Form.TagPicker>
  );
}

function Devices(props: IDevicesProps) {
  return (
    <Form.TagPicker
      id="deviceIds"
      title="Devices"
      defaultValue={props.devices?.devices.map((device) => device.id.toString())}
    >
      {props.devices?.devices.map((device) => (
        <Form.TagPicker.Item key={device.id.toString()} value={device.id.toString()} title={device.name} />
      ))}
    </Form.TagPicker>
  );
}

function CreateSchedule() {
  const preferences = getPreferences();
  const freedom = new Freedom(preferences.cookie, preferences.xCsrfToken);
  const {
    isLoading: isListFiltersExecuting,
    error: listFiltersError,
    data: filters,
  } = useQuery("filters", () => freedom.listFilters());

  const {
    isLoading: isListDevicesExecuting,
    error: listDevicesError,
    data: devices,
  } = useQuery("devices", () => freedom.listDevices());

  const createScheduleMutation = useMutation((data: ICreateScheduleData) => freedom.createShedule(data), {
    onSuccess: () => {
      showToast({ style: Style.Success, title: "Successfully created a schedule" });
      popToRoot();
    },
    onMutate: () => showToast({ style: Style.Animated, title: "Creating a schedule" }),
    onError: (error: any) => showToast({ style: Style.Failure, title: error.toString() }),
  });

  const [filtersError, setFiltersError] = useState<string | undefined>(undefined);

  const handleSubmit = (values: IForm) => {
    if (values.filterIds.length === 0) {
      setFiltersError("The field shouldn't be empty!");
      return;
    }
    createScheduleMutation.mutate({
      device_ids: values.deviceIds.map((id) => parseInt(id)),
      filter_list_ids: values.filterIds.map((id) => parseInt(id)),
      duration: parseInt(values.duration) * 60,
      start_time: "now",
      block_apps: false,
      block_everything: false,
    });
  };

  const isLoading = isListDevicesExecuting || isListFiltersExecuting || createScheduleMutation.isLoading;
  if (isLoading) {
    return <Form isLoading={isLoading} />;
  }

  const error = listFiltersError || listDevicesError || createScheduleMutation.error;
  if (error) {
    return <Detail markdown={error.toString()} />;
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Name" onSubmit={(values: IForm) => handleSubmit(values)} />
        </ActionPanel>
      }
    >
      <Duration />
      <Filters filters={filters} error={filtersError} setError={setFiltersError} />
      <Devices devices={devices} />
    </Form>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CreateSchedule />
    </QueryClientProvider>
  );
}
