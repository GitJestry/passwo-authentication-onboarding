# Simulation mask font

`text-security-disc-compat.woff2` is the unmodified compatibility font from
[`text-security` 3.2.1](https://www.npmjs.com/package/text-security/v/3.2.1), by Oskari Noppa,
based on Adobe Notdef and Adobe Blank 2. It is distributed under the adjacent SIL Open Font
License. Source: https://github.com/noppa/text-security.

Download: https://cdn.jsdelivr.net/npm/text-security@3.2.1/text-security-disc-compat.woff2

Use the compatibility font across browsers: the smaller non-compatibility variant uses a
character map that upstream explicitly excludes for Safari. The font masks Unicode text
without marking the simulation input as a native secure field. It does not protect the
underlying value or prevent every password manager from recognizing surrounding form text.
