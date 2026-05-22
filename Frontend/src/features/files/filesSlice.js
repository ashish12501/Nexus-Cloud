import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";

export const fetchFilesAndFolders = createAsyncThunk(
  "files/fetchFilesAndFolders",
  async (folderId = null, { rejectWithValue }) => {
    try {
      const endpoint = folderId
        ? `/files/files-folders-sorted/${folderId}`
        : "/files/files-folders-sorted";
      const { data } = await apiClient.get(endpoint, { withCredentials: true });
      return { ...data.data, folderId };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Unable to fetch directory contents",
      );
    }
  },
);

const initialState = {
  folders: [],
  files: [],
  path: [{ id: null, name: "Home" }],
  currentFolderId: null,
  loading: false,
  error: null,
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    openFolder: (state, action) => {
      const { id, name } = action.payload;
      state.path = [...state.path, { id, name }];
      state.currentFolderId = id;
    },
    goToBreadcrumb: (state, action) => {
      const index = action.payload;
      state.path = state.path.slice(0, index + 1);
      state.currentFolderId = state.path[state.path.length - 1]?.id || null;
    },
    resetFilesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesAndFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilesAndFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.folders = action.payload.folders || [];
        state.files = action.payload.files || [];
        state.currentFolderId = action.payload.folderId || null;
      })
      .addCase(fetchFilesAndFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load files";
      });
  },
});

export const { openFolder, goToBreadcrumb, resetFilesState } = filesSlice.actions;
export default filesSlice.reducer;
