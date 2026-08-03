const dns = require('node:dns').promises;
const net = require('node:net');

const { HttpError } = require('./httpError');

const privateIpv4Ranges = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' }
];

const privateIpv6Prefixes = ['::1', 'fc', 'fd', 'fe80'];

function ipToNumber(ip) {
  return ip.split('.').reduce((accumulator, octet) => ((accumulator << 8) + Number(octet)) >>> 0, 0);
}

function isPrivateIpv4(ip) {
  const numericIp = ipToNumber(ip);

  return privateIpv4Ranges.some((range) => {
    const start = ipToNumber(range.start);
    const end = ipToNumber(range.end);
    return numericIp >= start && numericIp <= end;
  });
}

function isPrivateIpv6(ip) {
  const lowerValue = ip.toLowerCase();

  if (lowerValue === '::1' || lowerValue.startsWith('::ffff:127.')) {
    return true;
  }

  return privateIpv6Prefixes.some((prefix) => lowerValue.startsWith(prefix));
}

function isPrivateIpAddress(ipAddress) {
  if (net.isIP(ipAddress) === 4) {
    return isPrivateIpv4(ipAddress);
  }

  if (net.isIP(ipAddress) === 6) {
    return isPrivateIpv6(ipAddress);
  }

  return false;
}

async function ensurePublicHttpUrl(value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new HttpError(400, 'Please provide a valid URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new HttpError(400, 'Only http:// and https:// URLs are allowed.');
  }

  if (!parsedUrl.hostname) {
    throw new HttpError(400, 'Please provide a valid URL.');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new HttpError(400, 'URLs with credentials are not allowed.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new HttpError(400, 'Local URLs are not allowed.');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) {
      throw new HttpError(400, 'Private or local IP addresses are not allowed.');
    }

    return parsedUrl.toString();
  }

  let lookupResults;

  try {
    lookupResults = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new HttpError(400, 'The URL could not be resolved.');
  }

  if (!lookupResults.length) {
    throw new HttpError(400, 'The URL could not be resolved.');
  }

  const privateAddress = lookupResults.find((entry) => isPrivateIpAddress(entry.address));

  if (privateAddress) {
    throw new HttpError(400, 'The URL resolves to a private or local address, which is not allowed.');
  }

  return parsedUrl.toString();
}

module.exports = {
  ensurePublicHttpUrl
};
