# peerbridge.ai: Post-Quantum Cryptography (PQC) Setup & Verification Guide

This guide provides step-by-step operating instructions to mitigate the quantum vulnerability discovered on **peerbridge.ai** by deploying a hybrid post-quantum key agreement (`X25519MLKEM768`) at the edge.

---

## The Threat: Harvest Now, Decrypt Later (HNDL)

In your TLS audit, the server negotiated:
* **Protocol**: TLSv1.3
* **Cipher Suite**: `TLS_AES_256_GCM_SHA384`
* **Key Exchange**: Classical RSA (2048-bit) or classical ECDHE (X25519)

### Why it is vulnerable:
While modern supercomputers cannot crack RSA-2048 or X25519 key agreements, a future cryptographically relevant quantum computer (CRQC) running Shor's algorithm can solve the prime factorization and discrete logarithm problems in seconds. 
Adversaries actively record encrypted traffic today ("harvesting") with the goal of decrypting it retrospectively once quantum computers are built ("decrypting later").

### The Defense: Hybrid Key Agreement
We implement the IETF standard **X25519MLKEM768**. This combines the speed and security of classical elliptic curve Diffie-Hellman (X25519) with the quantum-resistant Module-Lattice-Based Key Encapsulation Mechanism (ML-KEM-768). If one algorithm is broken, the other still protects the confidentiality of the session.

---

## Option A: Cloudflare Edge Integration (Recommended)

Cloudflare offers native, out-of-the-box support for post-quantum key agreement (`X25519MLKEM768`) and manages TLS handshakes directly at their global edge CDNs.

### Step 1: Add Domain to Cloudflare
1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click **Add a Site** and enter `peerbridge.ai`.
3. Choose the **Free Plan** (which includes full PQC support) and click **Continue**.
4. Cloudflare will automatically scan your active DNS records.

### Step 2: Update Domain Nameservers
1. Log in to your domain registrar (e.g., Squarespace Domains, GoDaddy, or Namecheap).
2. Go to the DNS / Nameservers management panel for `peerbridge.ai`.
3. Replace your registrar's default nameservers with the custom nameservers provided by Cloudflare:
   * *Example:* `rose.ns.cloudflare.com` and `will.ns.cloudflare.com`.
4. Save changes and wait for propagation (typically 5 to 15 minutes).

### Step 3: Enable Proxying (Orange Cloud)
1. Back in the Cloudflare Dashboard, go to **DNS** -> **Records**.
2. Locate the CNAME/A records pointing to your Firebase App Hosting CDN endpoint (e.g., `peerbridge--peerbridge-910b7.us-east4.hosted.app`).
3. Toggle the **Proxy Status** switch to **Proxied (Orange Cloud)** for both the root `@` and `www` records.
4. Click **Save**.

### Step 4: Configure Post-Quantum TLS Policies
1. Go to **SSL/TLS** -> **Edge Certificates** in the left sidebar.
2. Configure the following parameters:
   * **Minimum TLS Version**: Set to `TLS 1.2` (or `TLS 1.3` for maximum security).
   * **Opportunistic Encryption**: `Enabled`.
   * **TLS 1.3**: `Enabled`.
3. Verify that **Post-Quantum Cryptography** is enabled. (By default, Cloudflare negotiates `X25519MLKEM768` hybrid exchanges for all proxied traffic).

---

## Option B: Native Google Cloud SSL Policy Configuration

If you do not want to use Cloudflare proxying, you must create a custom Google Cloud Application Load Balancer in front of your Cloud Run containers and assign a custom SSL Policy.

### Step 1: Install & Authenticate the Google Cloud SDK
On your local machine, install the Google Cloud CLI (`gcloud`) and authenticate:

```bash
# Log in to your GCP account
gcloud auth login

# Set your active project ID
gcloud config set project peerbridge-910b7
```

### Step 2: Create a Custom SSL Policy with PQC Enabled
Run the following command using the `gcloud alpha` CLI to instantiate a custom policy:

```bash
# Create custom policy enforcing TLS 1.2+ and enabling Post-Quantum hybrid key exchange
gcloud alpha compute ssl-policies create pb-pqc-ssl-policy \
    --profile RESTRICTED \
    --min-tls-version 1.2 \
    --post-quantum-key-exchange ENABLED \
    --global
```

### Step 3: Deploy and Connect the External HTTPS Load Balancer
1. Go to your **GCP Console** -> **Network Services** -> **Load Balancing**.
2. Click **Create Load Balancer** and configure an **Application Load Balancer (HTTP/HTTPS)**.
3. Set your backend service to target the **Cloud Run** Next.js service container directly.
4. In the **Frontend Configuration**:
   * Set Protocol to **HTTPS**.
   * Select or upload your SSL certificate.
   * Under **SSL Policy**, select the newly created **pb-pqc-ssl-policy**.
5. Click **Create** to deploy.
6. Point your domain DNS records at your registrar directly to the Load Balancer's public IP address.

---

## Verification & Testing

To verify that your site is successfully negotiating quantum-resistant connections, run a TLS handshake scan using OpenSSL (v3.2+ required to support ML-KEM/Kyber):

```bash
# Run a hand-shake scan requesting post-quantum groups
openssl s_client -connect peerbridge.ai:443 -tls1_3 -groups x25519_kyber768:x25519_mlkem768 -msg
```

### Checking browser developer consoles:
1. Open Google Chrome (v124+) or Microsoft Edge.
2. Navigate to `https://peerbridge.ai`.
3. Open **Developer Tools** (F12) -> Go to the **Security** tab.
4. Inspect the **Connection** specifications:
   * **Successful PQC Handshake**: The connection should show:
     `Group: X25519Kyber768` or `Group: X25519MLKEM768` (hybrid)
   * **Classical Handshake**: If it shows `Group: X25519` or `Group: P-256`, the connection is still quantum-vulnerable.
