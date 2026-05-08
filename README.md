# EncoLink

A modern link management application with stunning design and powerful features, built with cutting-edge technologies.

![EncoLink](https://img.shields.io/badge/EncoLink-Link%20Manager-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform-lightgrey?style=for-the-badge)

##  Quick Start

Website - https://encolink.pages.dev

### Screenshots

-Main Interface

<img width="855" height="723" alt="image" src="https://github.com/user-attachments/assets/be754d80-abd7-4e29-ad20-9c3e60505663" />



##  Features

- **Link Management**: Organize and manage your links efficiently
- **URL Encryption**: AES-256 encryption for secure link protection
- **Time-Locked Links**: Restrict access by datetime or daily time windows with server-time verification
- **Bulk Operations**: Encrypt multiple links at once
- **Clipboard Detection**: Automatically detect and encrypt URLs from clipboard
- **Secure Time Verification**: Uses verified server time to prevent bypassing time locks by changing device time
- **Timezone Aware**: Automatically detects and displays user timezone
- **Zero Server Storage**: All encryption happens in your browser - complete privacy
- **Password Strength Indicator**: Real-time feedback on password security

### Time-Lock Security

Time-locked links use **verified server time** from multiple atomic clock APIs to prevent users from bypassing restrictions:

- **Multiple Time Sources**: WorldTimeAPI, TimeAPI.io, and WorldClockAPI
- **Timezone Detection**: Automatically detects user's timezone
- **No Client Time Trust**: Never relies on device time for validation
- **Bypass Prevention**: Even if a user changes their device time, server time is used for validation

### How Time-Lock Works

1. **Encryption**: Timezone information is stored with the encrypted data
2. **Verification**: System fetches current time from trusted time APIs
3. **Validation**: Access granted only if server time meets unlock conditions
4. **Display**: Unlock times shown in user's local timezone with offset (e.g., +05:30)



##  License

MIT License - see [LICENSE](LICENSE) file for details.

##  Developer

Developed with ❤️ by [AstralQuarks](https://github.com/editinghero)
Half AI Coded by Sonnet 4.5

---
