import {Injectable} from '@nestjs/common';
import {ExternalServerException} from "../exception/external-server.exception";
import * as sharp from "sharp";
import axios from "axios";
import {validate} from "class-validator";
import * as Path from "path";
import * as Fs from "fs";
import * as fs from "fs";
import {FileInfo} from "../asset/v1/type/file-info";
import {ImageDto} from "../asset/v1/dto/asset-v1.dto";

@Injectable()
export class ImageUtil {
    private fileSize: number;
    constructor(
        fileSize: number
    ) {
        this.fileSize = fileSize
    }

    public async getImageBySharp(imageDto: ImageDto): Promise<FileInfo> {
        try {
            let sharpObject;
            if ((Buffer.isBuffer(imageDto.buffer) && imageDto.buffer.length === 0) || (imageDto.buffer === undefined || imageDto.buffer === null)) {
                let input: Buffer | string = imageDto.path;
                const regex = new RegExp('^(https?|chrome):\\/\\/[^\\s$.?#].[^\\s]*$');
                if (regex.test(imageDto.path)) {
                    input =  (await axios({ url: imageDto.path, responseType: "arraybuffer" })).data as Buffer;
                }
                sharpObject = sharp(input);
            } else {
                sharpObject = await sharp(imageDto.buffer).grayscale();
            }

            if (!imageDto.isOriginal) {
                sharpObject = sharpObject.resize({ width: this.fileSize }).blur(false).blur(true);
            }

            await sharpObject.toFile(imageDto.filename);

            const assetInfo: FileInfo = {
                buffer: await sharpObject.toBuffer()
            }
            return assetInfo;
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    public async getImageByAxios (imageDto: ImageDto): Promise<FileInfo>  {
        const url = imageDto.path;
        const fileName = Path.basename(url);
        const filePath = Path.resolve(__dirname, '../files', fileName)
        this.mkdir(Path.dirname(filePath))
        const writer = Fs.createWriteStream(filePath);

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            })

            const assetInfo: FileInfo = {
                contentType: response.headers['content-type'],
                // buffer: await Buffer.from(response.data, "utf8")
                buffer: response.data
            }

            return assetInfo;

            // response.data.pipe(writer);
            // writer.on('finish', () => {
            //     return fs.statSync(filePath).size;
            // })
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    private mkdir(dirPath: string) {
        const isExists = fs.existsSync(dirPath);
        if( !isExists ) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

}
