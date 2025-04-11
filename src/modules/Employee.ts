import BaseModule from "../factory/BaseModule";
import {Controller} from "../factory/decorators";
import EmployeeModel from "../models/EmployeeModel";

class Employee extends BaseModule {
    constructor() {
        super();
        // Set model for this module
        this.setModel(EmployeeModel);
        
        this.registerRoute({
            path: '/names-only',
            method: 'GET',
            handler: this.getEmployeeNamesOnly
        })
    }

    @Controller()
    async getEmployeeNamesOnly(): Promise<string[]> {
        // Use model to get real data
        const employees = await EmployeeModel.find();
        return employees.map(emp => `${emp.firstName} ${emp.lastName}`);
    }
}
export default Employee;
