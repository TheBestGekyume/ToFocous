import { api } from "./api";

// LOGIN

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};


export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload
  );
  console.log("RESPONSE.DATA = ", response)
  return response.data;
}

//SIGNUP

type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export async function signUpUser(payload: SignupPayload) {
  /* const response = */await api.post("/auth/signup", payload);
  // return response.data;
}