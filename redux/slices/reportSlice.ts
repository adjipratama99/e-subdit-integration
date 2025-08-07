import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format, subWeeks } from "date-fns";

type DateRange = {
    dateFrom: string;
    dateUntil: string
}

interface ReportState {
    loading: boolean;
    open: boolean;
    typeData: string;
    hasClearedData: boolean;
    dateRange: DateRange;
    date: string;
    jenis: string;
}

const initialState: ReportState = {
    loading: false,
    open: true,
    typeData: "",
    hasClearedData: false,
    dateRange: {
        dateFrom: format(subWeeks(new Date(), 1), 'yyyy-MM-dd'),
        dateUntil: format(new Date(), 'yyyy-MM-dd')
    },
    date: format(new Date(), 'yyyy-MM-dd'),
    jenis: "",
};

export const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {
        toggleLoading: (state) => {
            state.loading = !state.loading;
        },
        toggleOpen: (state) => {
            state.open = !state.open;
        },
        toggleClearedData: (state, action: PayloadAction<boolean>) => {
            state.hasClearedData = action.payload;
        },
        changeTypeData: (state, action: PayloadAction<string>) => {
            state.typeData = action.payload;
        },
        changeDateRange: (state, action: PayloadAction<DateRange>) => {
            state.dateRange = action.payload;
        },
        changeDate: (state, action: PayloadAction<string>) => {
            state.date = action.payload;
        },
        changeJenis: (state, action: PayloadAction<string>) => {
            state.jenis = action.payload;
        },
    },
});

export const {
    toggleLoading,
    toggleOpen,
    toggleClearedData,
    changeTypeData,
    changeDateRange,
    changeDate,
    changeJenis
} = reportSlice.actions;

export default reportSlice.reducer;
