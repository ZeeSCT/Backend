// src/modules/schedules/schedules.controller.ts

import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { SchedulesService } from "./schedules.service";

@ApiTags("Schedules")
@Controller("api/v1/schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post("upload")
  @ApiOperation({ summary: "Upload and parse project schedule Excel file" })
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "projectCode", required: true, example: "PRJ-001" })
  @ApiQuery({ name: "dryRun", required: false, type: Boolean, example: true })
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
      fileFilter: (_req, file, callback) => {
        const isXlsx = file.originalname.toLowerCase().endsWith(".xlsx");

        const allowedMimeTypes = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/octet-stream",
        ];

        const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

        if (!isXlsx && !isAllowedMime) {
          return callback(
            new BadRequestException("Only .xlsx Excel files are allowed."),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadSchedule(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Query("projectCode") projectCode: string,
    @Query("dryRun") dryRun?: string,
  ) {
    if (!projectCode?.trim()) {
      throw new BadRequestException("projectCode is required.");
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException("No Excel file uploaded.");
    }

    return this.schedulesService.uploadSchedule({
      file,
      projectCode: projectCode.trim(),
      dryRun: dryRun === "true",
    });
  }

  @Get("uploads")
  @ApiOperation({ summary: "Get schedule uploads" })
  @ApiQuery({
    name: "projectCode",
    required: false,
    example: "PRJ-001",
  })
  async getUploads(@Query("projectCode") projectCode?: string) {
    return this.schedulesService.getUploads(projectCode);
  }

  @Get("uploads/latest")
  @ApiOperation({ summary: "Get latest schedule upload for a project" })
  @ApiQuery({
    name: "projectCode",
    required: true,
    example: "PRJ-001",
  })
  async getLatestUploadForProject(@Query("projectCode") projectCode: string) {
    if (!projectCode?.trim()) {
      throw new BadRequestException("projectCode is required.");
    }

    return this.schedulesService.getLatestUploadForProject(projectCode.trim());
  }

  @Get("uploads/:uploadId")
  @ApiOperation({ summary: "Get schedule upload by ID" })
  @ApiParam({ name: "uploadId", required: true })
  async getUploadById(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getUploadById(uploadId);
  }

  @Get("uploads/:uploadId/wbs")
  @ApiOperation({ summary: "Get WBS items for a schedule upload" })
  @ApiParam({ name: "uploadId", required: true })
  async getWbs(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getWbs(uploadId);
  }

  @Get("uploads/:uploadId/activities")
  @ApiOperation({ summary: "Get activities for a schedule upload" })
  @ApiParam({ name: "uploadId", required: true })
  async getActivities(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getActivities(uploadId);
  }

  @Get("uploads/:uploadId/milestones")
  @ApiOperation({ summary: "Get milestones for a schedule upload" })
  @ApiParam({ name: "uploadId", required: true })
  async getMilestones(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getMilestones(uploadId);
  }

  @Get("uploads/:uploadId/resources")
  @ApiOperation({ summary: "Get resource assignments for a schedule upload" })
  @ApiParam({ name: "uploadId", required: true })
  async getResources(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getResources(uploadId);
  }

  @Get("uploads/:uploadId/errors")
  @ApiOperation({ summary: "Get import errors for a schedule upload" })
  @ApiParam({ name: "uploadId", required: true })
  async getErrors(@Param("uploadId") uploadId: string) {
    return this.schedulesService.getErrors(uploadId);
  }

  @Delete("uploads/:uploadId")
  @ApiOperation({
    summary: "Delete schedule upload and imported schedule data",
  })
  @ApiParam({ name: "uploadId", required: true })
  async deleteUpload(@Param("uploadId") uploadId: string) {
    return this.schedulesService.deleteUpload(uploadId);
  }
}
