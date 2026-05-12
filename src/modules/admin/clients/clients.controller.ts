import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";

@ApiTags("Clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "Get all clients" })
  findAll() {
    return this.clientsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: "Create client" })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete client" })
  @ApiParam({ name: "id" })
  deleteClient(@Param("id") id: string) {
    return this.clientsService.deleteClient(id);
  }
}