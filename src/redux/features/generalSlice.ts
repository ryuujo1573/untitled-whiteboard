import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Locales, Themes } from "../../models/types";

export type AppState = {
  theme: Themes,
  locale: Locales,
  // TODO: locale support.
}

const initialState = (): AppState => {
  const themeSetting = localStorage.getItem('theme');

  if (themeSetting) {
    return {
      theme: themeSetting as Themes, //TODO: Exception in themeSetting
      locale: 'en',
    }
  }

  return {
    theme: Themes.auto,
    locale: 'en',
  }
}

const generalSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeTheme(state, action: PayloadAction<Themes>) {
      state.theme = action.payload;
    },
    // changeLocale(state, action: PayloadAction<{}>) {}
  }
})

const generalReducer = generalSlice.reducer
export const { changeTheme } = generalSlice.actions;

export default generalReducer;
