import BaseModule from "../factory/BaseModule";
import { Controller } from "../factory/decorators";
import UserModel from "../models/UserModel";

class User extends BaseModule {
    constructor() {
        super();
        this.setModel(UserModel);
    }

}

export default User;
