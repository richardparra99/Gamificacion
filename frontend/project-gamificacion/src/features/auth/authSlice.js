import { createSlice } from "@reduxjs/toolkit";

import {
  getAccessToken,
  saveAccessToken,
  removeAccessToken,
} from "../../utils/TokenUtilities";

const initialState = {
  usuario: null,
  token: getAccessToken(),
  autenticado: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    iniciarSesion: (state, action) => {
      const { usuario, token } = action.payload;

      state.usuario = usuario;
      state.token = token;
      state.autenticado = true;

      saveAccessToken(token);
    },

    establecerUsuario: (state, action) => {
      state.usuario = action.payload;
      state.autenticado = true;
    },

    cerrarSesion: (state) => {
      state.usuario = null;
      state.token = null;
      state.autenticado = false;

      removeAccessToken();
    },
  },
});

export const { iniciarSesion, establecerUsuario, cerrarSesion } =
  authSlice.actions;

export default authSlice.reducer;
