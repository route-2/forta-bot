interface NetworkData {
    name: string;
    escrowAddress:string;
}


  
  const ARBITRUM_DATA: NetworkData = {
    name: "Arbitrum",
    escrowAddress: "0xA10c7CE4b876998858b1a9E12b10092229539400",
  };
  
    const OPTIMISM_DATA: NetworkData = {
    name: "Optimism",
    escrowAddress: "0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65",
    };
    

    export const NETWORK_MAP: Record<number, NetworkData> = {
        42161: ARBITRUM_DATA,
        10: OPTIMISM_DATA,
    }

    export default class NetworkManager implements NetworkData {
 public name: string;
    public escrowAddress: string;
    networkMap: Record<number, NetworkData>;

    constructor(networkMap: Record<number, NetworkData>) {
        this.networkMap = networkMap;
        this.name = "";
        this.escrowAddress = "";

    }

    public setNetwork(networkId: number): void {

        try {
            const { name, escrowAddress} = this.networkMap[networkId];
            this.name = name;
            this.escrowAddress = escrowAddress;
            
        } catch (error) {
            throw new Error("Unsupported network ID");


        }
      
    }


    }