import { SigningKey, keccak256, getBytes, toBeHex, concat } from "ethers";

/**
 * Same derivation the node uses: keccak256(uncompressed_pubkey[1:])[12:].
 * Mirrors testnet-dashboard/lib/wallet.ts exactly so addresses match.
 */
export function addressFromPublicKey(uncompressedHex: string): string {
  const pub = getBytes(uncompressedHex);
  const hash = keccak256(pub.slice(1));
  return "0x" + hash.slice(-40);
}

export function addressFromPrivateKey(privateKey: string): string {
  const signingKey = new SigningKey(privateKey.trim());
  return addressFromPublicKey(signingKey.publicKey);
}

/**
 * Sign a transfer with a raw private key, entirely client-side and
 * in-memory only -- this module never touches localStorage. Must match
 * Transaction::signing_hash on the Rust side: keccak256(to(20) ||
 * amount_be(8) || nonce_be(8)).
 */
export function signTransfer(
  privateKey: string,
  to: string,
  amount: bigint,
  nonce: bigint
) {
  const signingKey = new SigningKey(privateKey.trim());
  const from = addressFromPublicKey(signingKey.publicKey);

  const toBytes = getBytes(to);
  const amountBytes = getBytes(toBeHex(amount, 8));
  const nonceBytes = getBytes(toBeHex(nonce, 8));
  const hash = keccak256(concat([toBytes, amountBytes, nonceBytes]));

  const sig = signingKey.sign(hash);
  const signature = (sig.r + sig.s.slice(2)).toLowerCase();

  return {
    from,
    to,
    amount: Number(amount),
    nonce: Number(nonce),
    pubkey: signingKey.publicKey,
    signature,
  };
}
