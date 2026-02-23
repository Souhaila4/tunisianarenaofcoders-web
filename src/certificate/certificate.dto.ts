import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateCertificateDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    hackathonName: string;
}
