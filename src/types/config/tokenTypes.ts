type payloadType = {
    id: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
}

type optionalPayloadType = {
    id: string;
    otp: string;
    verified?: boolean;
}

export type { payloadType, optionalPayloadType };