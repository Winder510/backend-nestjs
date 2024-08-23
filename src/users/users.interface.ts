export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}
export interface IUserRegister {
  name: string;
  email: string;
  password: string;
  age: string;
  gender: string;
  address: string;
}
