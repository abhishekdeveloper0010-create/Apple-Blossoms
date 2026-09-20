// =====================================================
// APPLE BLOSSOM
// SAVE GOOGLE REFRESH TOKEN  (Step 4 - Feature 7 Email)
//
// Gmail OAuth2 ka refresh token server/.env me safely
// update karne ke liye chhota helper.
//
// REFRESH TOKEN KAISE MILEGA ?
//   1) node generateToken.js
//   2) Printed URL browser me kholo
//   3) EMAIL_USER account se approve karo
//   4) Server terminal / log me "REFRESH TOKEN:" print hoga
//
// USAGE:
//   node saveRefreshToken.js "1//0gXXXXXXXX..."
//   node saveRefreshToken.js --from-log /tmp/ab_server.log
//   node saveRefreshToken.js --from-log /tmp/ab_server.log --dry-run
// =====================================================

const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, ".env");
const KEY = "GOOGLE_REFRESH_TOKEN";

const args = process.argv.slice(2);

const dryRun = args.includes("--dry-run");

const logFlagIndex = args.indexOf("--from-log");

// =====================================================
// TOKEN NIKALO (argv ya server log se)
// =====================================================

const extractFromLog = (logPath) => {
  if (!fs.existsSync(logPath)) {
    throw new Error(`Log file not found: ${logPath}`);
  }

  const content = fs.readFileSync(logPath, "utf8");

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("REFRESH TOKEN:")) {
      for (let j = i + 1; j < i + 5 && j < lines.length; j += 1) {
        const candidate = lines[j].trim();

        if (candidate && !candidate.startsWith("=")) {
          return candidate;
        }
      }
    }
  }

  throw new Error(
    "Refresh token log me nahi mila. Pehle OAuth flow complete karo."
  );
};

const getToken = () => {
  if (logFlagIndex !== -1) {
    const logPath = args[logFlagIndex + 1];

    if (!logPath) {
      throw new Error("--from-log ke baad log file ka path do");
    }

    return extractFromLog(logPath);
  }

  const direct = args.find((arg) => !arg.startsWith("--"));

  if (!direct) {
    throw new Error(
      'Refresh token do: node saveRefreshToken.js "1//0g..." ya --from-log <path>'
    );
  }

  return direct.trim();
};

// =====================================================
// TOKEN VALIDATE
// =====================================================

const validate = (token) => {
  if (!token || token.length < 30) {
    return "Refresh token bahut chhota lag raha hai";
  }

  if (!token.startsWith("1//")) {
    return 'Google refresh token "1//" se shuru hota hai';
  }

  return null;
};

// =====================================================
// .ENV UPDATE
// =====================================================

const updateEnvFile = (token) => {
  let content = "";

  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
  }

  const line = `${KEY}=${token}`;

  const pattern = new RegExp(`^${KEY}=.*$`, "m");

  let updated;

  if (pattern.test(content)) {
    updated = content.replace(pattern, line);
  } else {
    const suffix = content.endsWith("\n") || content === "" ? "" : "\n";

    updated = `${content}${suffix}${line}\n`;
  }

  return { content: updated, existed: pattern.test(content) };
};

// =====================================================
// MAIN
// =====================================================

try {
  const token = getToken();

  const problem = validate(token);

  if (problem) {
    console.error(`\n INVALID TOKEN: ${problem}\n`);
    process.exit(1);
  }

  const { content, existed } = updateEnvFile(token);

  console.log(`\nToken found  : ${token.slice(0, 8)}...${token.slice(-6)}`);
  console.log(`Env file     : ${ENV_PATH}`);
  console.log(`Key          : ${KEY} (${existed ? "update" : "add"})`);

  if (dryRun) {
    console.log("\nDRY RUN - kuch bhi write nahi kiya.\n");
    process.exit(0);
  }

  fs.writeFileSync(ENV_PATH, content, "utf8");

  console.log(
    "\nSAVED. Ab server restart karo (npm run dev) taaki email chalu ho jaye.\n"
  );
} catch (error) {
  console.error(`\nERROR: ${error.message}\n`);
  process.exit(1);
}
