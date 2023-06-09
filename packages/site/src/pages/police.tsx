import { useContext, useEffect, useState } from 'react';
import { EthrDID } from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import {
  Issuer,
  JwtCredentialPayload,
  createVerifiableCredentialJwt,
  JwtPresentationPayload,
  createVerifiablePresentationJwt,
} from 'did-jwt-vc';
import { MetaMaskContext, MetamaskActions } from '../hooks/MetamaskContext';
import { getDid, saveDid } from '../utils/snap';
import { signAndVerify } from '../utils/signAndVerify';

const Police = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [did, setDid] = useState<string | null>(null);

  /**
   *
   */
  const handleIssueDID = async () => {
    try {
      const address = state.accounts[0] as string;

      const ok = await signAndVerify(address, 'Another random message');
      if (!ok) {
        dispatch({
          type: MetamaskActions.SetError,
          payload: 'Address verification failed',
        });
        return;
      }
      console.log(`Congrats, address: ${address} verified!`);
      dispatch({
        type: MetamaskActions.SetAddressVerified,
        payload: { [address]: true },
      });

      const issuer = new EthrDID({
        identifier: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
        privateKey:
          'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
      }) as Issuer;

      const vcPayload: JwtCredentialPayload = {
        sub: `did:ethr:${address}`,
        nbf: 1562950282,
        vc: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject: {
            document: {
              type: 'DriversLicence',
              name: 'Dra',
              surname: 'Dasi',
            },
          },
        },
      };

      const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);
      const vpPayload: JwtPresentationPayload = {
        vp: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: [vcJwt],
        },
      };

      const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer);
      const d = { [state.accounts[0]]: vpJwt };
      const newDids = (await saveDid(d)) as Record<string, string>;
      setDid(newDids[state.accounts[0]]);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <>
      <div className="col-lg-10 mx-auto p-4 py-md-5">
        <main>
          <h1 className="text-body-emphasis">
            Issue Your Digital Driving License
          </h1>
          {did ? (
            <h2>
              Driver Licencse DID issued ✅:
              <pre>
                <code>
                  <>{did}</>
                </code>
              </pre>
            </h2>
          ) : (
            <></>
          )}
          <p className="fs-5 col-md-8">
            Issue your personal driving license as{' '}
            <a href="https://www.w3.org/TR/did-core/">
              DID / Decentralized Identifier
            </a>
            <br />
            Store Your DID in Metamask wallet to present for validation and
            verification to other organisations and companies.
          </p>

          <p>{state.accounts[0]}</p>

          <div className="mb-5">
            <button
              // disabled={!state.isConnected}
              onClick={async () => await handleIssueDID()}
              className="btn btn-primary btn-lg px-4"
            >
              Issue DID for Driving license
            </button>
          </div>

          <hr className="col-3 col-md-2 mb-5"></hr>

          <div className="row g-5">
            <div className="col-md-6">
              <h2 className="text-body-emphasis">How to use DID</h2>
              <p>
                You store your DID in cryptocraphic wallet ( Metamask ). You can
                present you to all interested parties for validation.
              </p>
            </div>

            <div className="col-md-6">
              <h2 className="text-body-emphasis">What is DID?</h2>
              <p>
                DID is a digital certificate for your document. Read more at{' '}
                <a href="https://www.w3.org/TR/did-core/">
                  DID / Decentralized Identifier{' '}
                </a>
              </p>
            </div>
          </div>
        </main>
        <footer className="pt-5 my-5 text-body-secondary border-top">
          Created by the DRADASI team &middot; &copy; 2023
        </footer>
      </div>
    </>
  );
};

export default Police;

export { Head } from '../components/Head';
