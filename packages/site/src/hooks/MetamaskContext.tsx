import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Snap } from '../types';
import { isFlask, getSnap } from '../utils';
import { signAndVerify } from '../utils/signAndVerify';

export type MetamaskState = {
  isFlask: boolean;
  isConnected: boolean;
  installedSnap?: Snap;
  error?: Error;
  nftID?: bigint;
  accounts: any[];
  chainID: number;
  hasProvider: boolean;
  connecting: boolean;
  connectMetamask: () => Promise<void>;
  addressVerified: { [key: string]: boolean };
};

const initialState: MetamaskState = {
  isFlask: false,
  isConnected: false,
  error: undefined,
  nftID: undefined,
  accounts: [],
  chainID: 0,
  hasProvider: false,
  connecting: false,
  connectMetamask: async () => {},
  addressVerified: {},
};

type MetamaskDispatch = { type: MetamaskActions; payload: any };

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<MetamaskDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum MetamaskActions {
  SetInstalled = 'SetInstalled',
  SetFlaskDetected = 'SetFlaskDetected',
  SetError = 'SetError',
  SetNFTID = 'SetNFTID',
  SetHasProvider = 'SetHasProvider',
  SetAccounts = 'SetAccounts',
  SetNetwork = 'SetNetwork',
  SetConnecting = 'SetConnecting',
  SetIsConnected = 'SetIsConnected',
  SetAddressVerified = 'SetAddressVerified',
}

const reducer: Reducer<MetamaskState, MetamaskDispatch> = (state, action) => {
  switch (action.type) {
    case MetamaskActions.SetInstalled:
      return {
        ...state,
        installedSnap: action.payload,
      };

    case MetamaskActions.SetFlaskDetected:
      return {
        ...state,
        isFlask: action.payload,
      };

    case MetamaskActions.SetError:
      return {
        ...state,
        error: action.payload,
      };

    case MetamaskActions.SetNFTID:
      return {
        ...state,
        nftID: action.payload,
      };

    case MetamaskActions.SetAccounts:
      return {
        ...state,
        accounts: action.payload,
      };

    case MetamaskActions.SetNetwork:
      return {
        ...state,
        chainID: action.payload,
      };

    case MetamaskActions.SetHasProvider:
      return {
        ...state,
        hasProvider: action.payload,
      };

    case MetamaskActions.SetConnecting:
      return {
        ...state,
        connecting: action.payload,
      };

    case MetamaskActions.SetAddressVerified:
      return {
        ...state,
        addressVerified: { ...state.addressVerified, ...action.payload },
      };

    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  // useCallback ensures that you don't uselessly recreate the _updateWallet function on every render
  const _updateWallet = useCallback(async (providedAccounts?: any) => {
    const accounts =
      providedAccounts ||
      (await window.ethereum.request({ method: 'eth_accounts' }));

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      // setWallet(disconnectedState);
      dispatch({
        type: MetamaskActions.SetAccounts,
        payload: [],
      });
      return;
    }

    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    dispatch({
      type: MetamaskActions.SetNetwork,
      payload: chainId,
    });

    dispatch({
      type: MetamaskActions.SetAccounts,
      payload: accounts,
    });
  }, []);

  const updateWalletAndAccounts = useCallback(
    () => _updateWallet(),
    [_updateWallet],
  );
  const updateWallet = useCallback(
    (accounts: any) => _updateWallet(accounts),
    [_updateWallet],
  );

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });

      dispatch({
        type: MetamaskActions.SetHasProvider,
        payload: Boolean(provider),
      });

      if (provider) {
        updateWalletAndAccounts();
        window.ethereum.on('accountsChanged', updateWallet);
        window.ethereum.on('chainChanged', updateWalletAndAccounts);
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener('accountsChanged', updateWallet);
      window.ethereum?.removeListener('chainChanged', updateWalletAndAccounts);
    };
  }, [updateWallet, updateWalletAndAccounts]);

  useEffect(() => {
    async function detectFlask() {
      const isFlaskDetected = await isFlask();

      dispatch({
        type: MetamaskActions.SetFlaskDetected,
        payload: isFlaskDetected,
      });
    }

    async function detectSnapInstalled() {
      const installedSnap = await getSnap();
      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    }

    detectFlask();

    if (state.isFlask) {
      detectSnapInstalled();
    }
  }, [state.isFlask, window.ethereum]);

  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({
          type: MetamaskActions.SetError,
          payload: undefined,
        });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  useEffect(() => {
    console.log(state.nftID);
  }, [state.nftID]);

  const connectMetamask = async () => {
    dispatch({
      type: MetamaskActions.SetConnecting,
      payload: true,
    });

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      // clearError();
      updateWallet(accounts);
    } catch (err: any) {
      dispatch({
        type: MetamaskActions.SetError,
        payload: err,
      });
    }

    dispatch({
      type: MetamaskActions.SetConnecting,
      payload: false,
    });
  };

  return (
    <MetaMaskContext.Provider value={[{ ...state, connectMetamask }, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};
