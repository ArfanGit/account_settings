import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Primary login route: POST /api/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    description: 'Login credentials (use username field for email in OAuth2 flow)',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'user@example.com',
          description: 'User email (sent as username for OAuth2 compatibility)',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'User password',
        },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: FastifyRequest): Promise<TokenResponseDto> {
    // Handle both JSON and form-encoded data
    let email: string;
    let password: string;

    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form data (for Swagger OAuth2 flow) - OAuth2 sends 'username' field
      const body = req.body as any;
      email = body.username || body.email; // OAuth2 sends 'username', we accept both
      password = body.password;
    } else {
      // JSON data
      const body = req.body as LoginDto;
      email = body.email;
      password = body.password;
    }

    return this.authService.login({ email, password } as LoginDto);
  }

  // Compatibility route for existing frontend: POST /api/auth/login
  // Delegates to the same login handler
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async loginAuthPath(@Req() req: FastifyRequest): Promise<TokenResponseDto> {
    return this.login(req);
  }
}
