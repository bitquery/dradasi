import { ethers, BigNumber } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { MetaMaskContext, MetamaskActions } from '../hooks/MetamaskContext';
import { verifyPresentation } from 'did-jwt-vc';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { getDid } from '../utils/snap';
import { generateRandomBigInt } from '../utils/nft';
import { signAndVerify } from '../utils/signAndVerify';
import contractABI from '../../../../contractABI.json';
import { callContractMethod } from '../utils';

const Rent = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [did, setDid] = useState<string>('');
  const [nftId, setNftId] = useState<bigint | null>(null);
  const [notification, setNotification] = useState('');

  const contractAddress = '0x7dbC1972E8dC9258611Cb3929AC0e63eaF8a2c0a';
  const methodName = 'rental';
  const weiAmount = BigNumber.from(1);

  useEffect(() => {
    (async () => {
      if (state.installedSnap) {
        const loadedDid = (await getDid(state.accounts[0])) as string;
        setDid(loadedDid);
        console.log('loadedDid', loadedDid);
      }
    })();
  }, [state.installedSnap]);

  /**
   * Verifiers jwt and handlers rent process. In non-hackaton world this would be moved
   * probably to some backend.
   *
   */
  const handleRent = async () => {
    if (!did) {
      dispatch({
        type: MetamaskActions.SetError,
        payload: 'DID not provided',
      });
      return;
    }

    // set random BigInt for NFT ID
    // await handleVerifyDID();
    const providerConfig = {
      networks: [
        {
          name: 'mainnet',
          rpcUrl:
            'https://mainnet.infura.io/v3/997db0785ce14d3ebb8f379c4e4acf6b',
          // registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
        },
        {
          name: '0x5',
          rpcUrl:
            'https://goerli.infura.io/v3/997db0785ce14d3ebb8f379c4e4acf6b',
        },
      ],
    };

    const resolver = new Resolver(getResolver(providerConfig));
    // const doc = await resolver.resolve(`did:ethr:${address}`);
    // const verifiedVC = await verifyCredential(vcJwt, resolver);
    const verifiedVP = await verifyPresentation(did, resolver);
    console.log(verifiedVP.verified);
    console.log(verifiedVP);

    const credentialId: string | undefined =
      verifiedVP.verifiablePresentation.verifiableCredential?.[0]
        .credentialSubject.id;

    if (!credentialId) {
      dispatch({
        type: MetamaskActions.SetError,
        payload: 'There is no credentialId in the provided DID',
      });
      return;
    }

    const regex = /^did:ethr:(\w+)$/u; // Regular expression to match the desired format
    const match = credentialId.match(regex);

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (match && match[1]) {
      console.log(match[1]); // Output: 0xF1232F840f3aD7d23FcDaA84d6C66dac24EFb198
    } else {
      dispatch({
        type: MetamaskActions.SetError,
        payload: 'did:ethr:0x.. format is not valid',
      });
      return;
    }

    const addr = match[1];
    const message = 'Random message';
    const ok = await signAndVerify(addr, message);
    if (!ok) {
      dispatch({
        type: MetamaskActions.SetError,
        payload: 'Address verification failed',
      });
      return;
    }
    console.log('Congrats, address verified!');
    dispatch({ type: MetamaskActions.SetAddressVerified, payload: true });

    const randomBigInt = generateRandomBigInt(256); // Generate a random 256-bit BigInt
    setNftId(randomBigInt);

    const result = callContractMethod(randomBigInt);
    console.log(result);
    setNotification('Car rented');
  };

  return (
    <>
      <div className="container py-3">
        <div className="pricing-header p-3 pb-md-4 mx-auto text-center">
          <h1 className="display-4 fw-normal text-body-emphasis">
            Remote Car Rental Easy
          </h1>
          {state.error && (
            <div className="alert alert-danger" role="alert">
              <>{state.error.message || state.error}</>
            </div>
          )}
          {notification && (
            <div className="alert alert-primary" role="alert">
              <>{notification}</>
            </div>
          )}
        </div>

        <main>
          <div className="d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-center justify-content-center">
            <div className="list-group">
              <div
                className="list-group-item list-group-item-action d-flex gap-3 py-3"
                aria-current="true"
              >
                <img
                  src="./icon.png"
                  alt="twbs"
                  width="64"
                  height="64"
                  className="rounded-circle flex-shrink-0"
                />
                <div className="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h3 className="mb-0">
                      Prove your Identity using Decentralized DID
                    </h3>
                    <p className="mb-0 opacity-75">
                      Load your identity from Metamask for validation
                    </p>
                  </div>
                  <small className="opacity-50 text-nowrap">now</small>
                </div>
              </div>
              <div
                className="list-group-item list-group-item-action d-flex gap-3 py-3"
                aria-current="true"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjk0t-g0yfL4fsJD4WuD6C4WwDmJ2eMjHgCw&usqp=CAU"
                  alt="twbs"
                  width="64"
                  height="64"
                  className="rounded-circle flex-shrink-0"
                />
                <div className="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h3 className="mb-0">Pay with crypto currency</h3>
                    <p className="mb-0 opacity-75">
                      Use Metamask to pay in crypto for rental
                    </p>
                  </div>
                  <small className="opacity-50 text-nowrap">next</small>
                </div>
              </div>
              <div
                className="list-group-item list-group-item-action d-flex gap-3 py-3"
                aria-current="true"
              >
                <img
                  src="https://thegivingblock.com/wp-content/uploads/2023/02/MetaMask-Partnership-The-Giving-Block.png"
                  alt="twbs"
                  width="64"
                  height="64"
                  className="rounded-circle flex-shrink-0"
                />
                <div className="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h3 className="mb-0">Get NFT to Ride the Car</h3>
                    <p className="mb-0 opacity-75">
                      Get Your NFT to Open the Car.
                    </p>
                  </div>
                  <small className="opacity-50 text-nowrap">after</small>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-center">Select Your Next Car</h1>

          <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
            <div className="col">
              <div className="card mb-4 rounded-3 shadow-sm">
                <div className="card-header py-3">
                  <h4 className="my-0 fw-normal">Cheap</h4>
                </div>
                <div className="card-body">
                  <h1 className="card-title pricing-card-title">
                    1 WEI
                    <small className="text-body-secondary fw-light">/day</small>
                  </h1>
                  <img
                    style={{ width: '240px' }}
                    src="data:image/jpeg;base64,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"
                  />
                  <button
                    onClick={handleRent}
                    disabled={did === ''}
                    type="button"
                    className="w-100 btn btn-lg btn-outline-primary"
                  >
                    Rent
                  </button>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card mb-4 rounded-3 shadow-sm">
                <div className="card-header py-3">
                  <h4 className="my-0 fw-normal">Cheaper</h4>
                </div>
                <div className="card-body">
                  <h1 className="card-title pricing-card-title">
                    2 WEI
                    <small className="text-body-secondary fw-light">/day</small>
                  </h1>
                  <img
                    style={{ width: '240px' }}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/1987_Lada_Niva_1600.jpg/2560px-1987_Lada_Niva_1600.jpg"
                  />

                  <button
                    onClick={handleRent}
                    disabled={did === ''}
                    type="button"
                    className="w-100 btn btn-lg btn-outline-primary"
                  >
                    Rent
                  </button>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card mb-4 rounded-3 shadow-sm border-primary">
                <div className="card-header py-3 text-bg-primary border-primary">
                  <h4 className="my-0 fw-normal">For Crypto Investors</h4>
                </div>
                <div className="card-body">
                  <h1 className="card-title pricing-card-title">
                    3 ETH
                    <small className="text-body-secondary fw-light">/day</small>
                  </h1>
                  <img
                    style={{ width: '240px' }}
                    src="https://st4.depositphotos.com/12279032/24671/i/1600/depositphotos_246712438-stock-photo-old-rusty-destroyed-car-abandoned.jpg"
                  />

                  <button
                    onClick={handleRent}
                    disabled={did === ''}
                    type="button"
                    className="w-100 btn btn-lg btn-primary"
                  >
                    Rent
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 className="display-6 text-center mb-4">Compare plans</h2>
        </main>

        <footer className="pt-4 my-md-5 pt-md-5 border-top">
          <div className="row">
            <div className="col-12 col-md">
              <small className="d-block mb-3 text-body-secondary">
                &copy; 2017–2023
              </small>
            </div>
            <div className="col-6 col-md">
              <h5>Features</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Cool stuff
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Random feature
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Team feature
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Stuff for developers
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Another one
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Last time
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-6 col-md">
              <h5>Resources</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Resource
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Resource name
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Another resource
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Final resource
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-6 col-md">
              <h5>About</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Team
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Locations
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Privacy
                  </a>
                </li>
                <li className="mb-1">
                  <a className="link-secondary text-decoration-none" href="#">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossOrigin="anonymous"
      ></script>
    </>
  );
};

export default Rent;

export { Head } from '../components/Head';
