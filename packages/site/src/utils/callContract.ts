import { BigNumber, ethers } from 'ethers';
import contractABI from '../../../../contractABI.json';

const contractAddress = '0xF3da5C648f378fD2feb47CD1Fc4321A5F77F5533';
const methodName = 'rental';
const weiAmount = BigNumber.from(1);

async function connectToMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
  }
  throw new Error('MetaMask not detected');
}

async function connectAndCreateContract() {
  const provider = await connectToMetaMask();
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  return contract;
}

export async function callContractMethod(
  id: bigint | undefined,
  data: string | undefined,
) {
  if (!id) {
    throw new Error('id is undefined');
  }

  const contract = await connectAndCreateContract();
  const methodParams = [id, data];
  const result = await contract[methodName](...methodParams, {
    value: weiAmount,
  });
  console.log(result);
}
