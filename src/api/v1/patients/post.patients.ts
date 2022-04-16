import {Request, Response} from "express";
import {DiagnoseModel} from "../../../db/models/diagnose";
import {PatientModel} from "../../../db/models/patient";

export const findDiagnoseByID = async (diagnoseID: number, res: Response) => {
                        //the same as Boolean(await DiagnoseModel...) https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
    const diagnoseExists: boolean = !!(await DiagnoseModel.findByPk(diagnoseID, {attributes: ['id']}));
    if(!diagnoseExists) {
        res.status(404).json({'message': `Diagnose with ID ${diagnoseID} does not exist!`});
    }
    return diagnoseExists;
}

export const workflow = async (req: Request, res: Response) => {
    const {firstName, lastName, birthdate, weight, height, identificationNumber, gender, diagnoseID} = req.body;

    const diagnoseExists = await findDiagnoseByID(Number(diagnoseID), res);
    if (!diagnoseExists) {
        return;
    }

    const [patient, created] = await PatientModel.findOrCreate({
        where: {identificationNumber: identificationNumber},
        defaults: {
            firstName: firstName,
            lastName: lastName,
            birthdate: birthdate,
            weight: weight,
            height: height,
            identificationNumber: identificationNumber,
            gender: gender,
            diagnoseID: diagnoseID
        }
    });

    if (!created) {
        res.status(409).json({'message': `Patient with the same identification number (${identificationNumber}) already exists in DB!`});
        return
    }

    res.status(201).json({'message': 'New patient was created!'});
}