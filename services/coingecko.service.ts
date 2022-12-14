import axios from "axios";
import HttpException from "../classes/HttpException";

export class CoingeckoService {
    public async getCoingeckoData(url: string): Promise<any>{
        let data;
        let urlConfig = {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic`
            }
        }
        await axios.get(url, urlConfig)
            .then((response)=> {
                if(response) {
                    data = response.data;
                }
            })
            .catch(error => {
                new HttpException(400, error);
            })
        return data;
    }
}
