import { ethers } from 'ethers';

export async function signAndVerify(
  address: string,
  message: string,
): Promise<boolean> {
  // Ensure MetaMask is installed and connected
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    throw new Error('MetaMask is not installed or not connected');
  }

  // Request access to the user's accounts
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();

  // Sign the message
  const signature = await signer.signMessage(message);

  // Verify the signature
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  const isSignatureValid =
    recoveredAddress.toLowerCase() === address.toLowerCase();
  console.log('recoveredAddress', recoveredAddress.toLowerCase());
  console.log('address', address.toLowerCase());

  return isSignatureValid;
}
