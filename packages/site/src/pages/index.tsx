import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { EthrDID } from 'ethr-did';
import {
  Issuer,
  JwtCredentialPayload,
  createVerifiableCredentialJwt,
  JwtPresentationPayload,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation,
} from 'did-jwt-vc';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  clearDids,
  connectSnap,
  getDid,
  getSnap,
  saveDid,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  AnyButton,
  CallSCButton,
  Card,
  ConnectButton,
  InstallFlaskButton,
  IssueButton,
  ReconnectButton,
  SetIDButton,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;

  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }

  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [did, setDid] = useState<unknown | null>(null);

  useEffect(() => {
    (async () => {
      if (state.installedSnap) {
        const loadedDid = (await getDid(state.accounts[0])) as Record<
          string,
          unknown
        >;
        setDid(loadedDid);
        console.log(loadedDid);
      }
    })();
  }, [state.installedSnap]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleClearDids = async () => {
    try {
      await clearDids();
      setDid(null);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  /**
   * Verifiers jwt and handlers rent process. In non-hackaton world this would be moved
   * probably to some backend.
   *
   * @param jwt DID JWT provided by user.
   * @returns void
   */
  const handleRent = (jwt: string) => async () => {
    if (!jwt) {
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
    const verifiedVP = await verifyPresentation(jwt, resolver);
    console.log(verifiedVP.verified);
    function generateRandomBigInt(length: number): bigint {
      const byteLength = Math.ceil(length / 8); // Convert bits to bytes
      const randomBytes = new Uint8Array(byteLength);
      crypto.getRandomValues(randomBytes);
      const hexString = Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      return BigInt(`0x${hexString}`);
    }

    const randomBigInt = generateRandomBigInt(256); // Generate a random 256-bit BigInt
    dispatch({ type: MetamaskActions.SetNFTID, payload: BigInt(randomBigInt) });
  };


  return (
    <Container>
      <Heading>
        Welcome to <Span>DRADASI</Span>
      </Heading>
      <Subtitle>{did ? <code>Loaded DID</code> : <>No DID found</>}</Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            fullWidth
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            fullWidth
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Clear dids',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: AnyButton('Clear dids', {
              onClick: handleClearDids,
              disabled: !state.installedSnap,
            }),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
        <Card
          content={{
            title: 'Issue Drivers Licence',
            description: 'Issue Drivers Licence DID.',
            button: (
              <IssueButton
                disabled={!state.installedSnap}
                onClick={handleIssueDID}
              />
            ),
          }}
        />
        <Card
          content={{
            title: 'Rent',
            description: 'Rent a car',
            button: (
              <SetIDButton
                disabled={!state.installedSnap}
                onClick={handleRent(did)}
              />
            ),
          }}
          disabled={!state.installedSnap}
        />
        <Card
          content={{
            title: 'Pay',
            description: 'Pay for rental.',
            button: <CallSCButton disabled={!state.installedSnap} />,
          }}
          disabled={!state.installedSnap}
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
